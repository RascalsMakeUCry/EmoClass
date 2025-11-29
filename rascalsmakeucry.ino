#include <WiFi.h>
#include <WiFiManager.h>
#include <HTTPClient.h>
#include <WiFiClientSecure.h>
#include <ArduinoJson.h>
#include <DHT.h>
#include <time.h>

// --- PIN DEFINISI ---
#define DHT_PIN 4
#define DHT_TYPE DHT11

#define MQ_AO_PIN 34
#define MQ_DO_PIN 27
#define LDR_AO_PIN 35
#define LDR_DO_PIN 26
#define SOUND_AO_PIN 32
#define SOUND_DO_PIN 25

DHT dht(DHT_PIN, DHT_TYPE);
WiFiManager wm;

// --- NTP Server untuk WIB (UTC+7) ---
const char* ntpServer = "pool.ntp.org";
const long gmtOffset_sec = 7 * 3600;  // WIB = UTC+7
const int daylightOffset_sec = 0;     // Indonesia tidak pakai DST

// --- SERVER URL (Next.js API) ---
String SERVER_URL = "https://emoclass-sage.vercel.app/api/iot/apiBE";

// Interval pengiriman data (ms)
const unsigned long SENSOR_READ_INTERVAL = 15000;
unsigned long lastSensorReadTime = 0;

// ---- FUNGSI GET TIMESTAMP WIB ----
String getWIBTimestamp() {
  struct tm timeinfo;
  if (!getLocalTime(&timeinfo)) {
    Serial.println("Failed to obtain time");
    return "";
  }
  
  char timeString[30];
  // Format: 2025-11-28T23:51:51+07:00 (ISO 8601 dengan timezone WIB)
  strftime(timeString, sizeof(timeString), "%Y-%m-%dT%H:%M:%S+07:00", &timeinfo);
  return String(timeString);
}

// ---- FUNGSI BACA SENSOR DAN BUAT JSON ----
String readSensorData() {
  float humidity = dht.readHumidity();
  float temperature = dht.readTemperature();
  
  if (isnan(humidity) || isnan(temperature)) {
    Serial.println("Gagal membaca sensor DHT!");
    return "{}";
  }

  int gasAnalog = analogRead(MQ_AO_PIN);
  int gasDigital = digitalRead(MQ_DO_PIN);
  int lightAnalog = analogRead(LDR_AO_PIN);
  int lightDigital = digitalRead(LDR_DO_PIN);
  int soundAnalog = analogRead(SOUND_AO_PIN);
  int soundDigital = digitalRead(SOUND_DO_PIN);

  // Get WIB timestamp
  String timestamp = getWIBTimestamp();

  DynamicJsonDocument doc(1024);
  doc["temperature"] = temperature;
  doc["humidity"] = humidity;
  doc["gas"]["analog"] = gasAnalog;
  doc["gas"]["digital"] = gasDigital;
  doc["light"]["analog"] = lightAnalog;
  doc["light"]["digital"] = lightDigital;
  doc["sound"]["analog"] = soundAnalog;
  doc["sound"]["digital"] = soundDigital;
  doc["deviceId"] = WiFi.macAddress();
  doc["timestamp"] = timestamp;  // Tambahkan timestamp WIB
  doc["timezone"] = "Asia/Jakarta";

  String jsonString;
  serializeJson(doc, jsonString);
  return jsonString;
}

// ---- SETUP ----
void setup() {
  Serial.begin(115200);
  dht.begin();

  pinMode(MQ_DO_PIN, INPUT_PULLUP);
  pinMode(LDR_DO_PIN, INPUT_PULLUP);
  pinMode(SOUND_DO_PIN, INPUT_PULLUP);

  // WiFiManager untuk koneksi mudah
  Serial.println("Menghubungkan ke Wi-Fi...");
  if (!wm.autoConnect("ESP32-Setup", "12345678")) {
    Serial.println("Gagal konek Wi-Fi, restart dalam 5 detik...");
    delay(5000);
    ESP.restart();
  }

  Serial.println("Wi-Fi terhubung!");
  Serial.print("IP Address: ");
  Serial.println(WiFi.localIP());

  // ---- SETUP NTP untuk WIB ----
  Serial.println("Menyinkronkan waktu dengan NTP server...");
  configTime(gmtOffset_sec, daylightOffset_sec, ntpServer);
  
  // Tunggu hingga waktu tersinkronisasi
  struct tm timeinfo;
  int retries = 0;
  while (!getLocalTime(&timeinfo) && retries < 10) {
    Serial.print(".");
    delay(1000);
    retries++;
  }
  
  if (getLocalTime(&timeinfo)) {
    Serial.println("\nWaktu WIB berhasil disinkronkan!");
    Serial.print("Waktu sekarang (WIB): ");
    Serial.println(&timeinfo, "%A, %d %B %Y %H:%M:%S");
  } else {
    Serial.println("\nGagal sinkronisasi waktu NTP!");
  }
}

// ---- KIRIM DATA ----
bool sendData(String payload) {
  WiFiClientSecure client;
  client.setInsecure(); // terima semua sertifikat SSL

  HTTPClient https;
  https.begin(client, SERVER_URL);
  https.addHeader("Content-Type", "application/json");

  int httpCode = https.POST(payload);
  if (httpCode > 0) {
    Serial.println("HTTP Response code: " + String(httpCode));
    String response = https.getString();
    Serial.println("Response: " + response);
    https.end();
    return true;
  } else {
    Serial.println("Error HTTP: " + String(httpCode));
    https.end();
    return false;
  }
}

// ---- LOOP ----
void loop() {
  // Reconnect Wi-Fi jika terputus
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("Wi-Fi terputus, mencoba reconnect...");
    WiFi.reconnect();
    delay(5000);
    return;
  }

  unsigned long now = millis();
  if (now - lastSensorReadTime >= SENSOR_READ_INTERVAL) {
    lastSensorReadTime = now;

    String payload = readSensorData();
    Serial.println("Mengirim data (WIB): " + payload);

    // Retry 3x jika gagal
    int retries = 3;
    bool success = false;
    while (retries-- && !success) {
      success = sendData(payload);
      if (!success) {
        Serial.println("Retry dalam 3 detik...");
        delay(3000);
      }
    }

    if (!success) {
      Serial.println("Gagal mengirim data setelah 3 percobaan.");
    }
  }
}