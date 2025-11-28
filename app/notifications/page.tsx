export default function NotificationsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-block mb-4">
            <div className="w-20 h-20 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl flex items-center justify-center shadow-xl">
              <span className="text-4xl">🔔</span>
            </div>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-4">
            Notifications
          </h1>
          <p className="text-gray-600 text-lg">
            Notifikasi dan alert untuk guru
          </p>
        </div>

        {/* Coming Soon Card */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-12 text-center">
          <div className="mb-6">
            <span className="text-6xl">🚧</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Coming Soon
          </h2>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            Pusat notifikasi sedang dalam pengembangan. Anda akan dapat melihat semua alert dan notifikasi penting di satu tempat.
          </p>
          
          {/* Feature List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto text-left">
            <div className="bg-red-50 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <span className="text-2xl">🚨</span>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-1">Student Alerts</h3>
                  <p className="text-sm text-gray-600">Notifikasi siswa yang butuh perhatian khusus</p>
                </div>
              </div>
            </div>
            
            <div className="bg-orange-50 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <span className="text-2xl">📱</span>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-1">In-App Notifications</h3>
                  <p className="text-sm text-gray-600">Lihat semua notifikasi dalam aplikasi</p>
                </div>
              </div>
            </div>
            
            <div className="bg-blue-50 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <span className="text-2xl">✅</span>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-1">Mark as Read</h3>
                  <p className="text-sm text-gray-600">Tandai notifikasi sebagai sudah dibaca</p>
                </div>
              </div>
            </div>
            
            <div className="bg-purple-50 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <span className="text-2xl">🔍</span>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-1">Filter & Search</h3>
                  <p className="text-sm text-gray-600">Filter notifikasi berdasarkan tipe atau tanggal</p>
                </div>
              </div>
            </div>
          </div>

          {/* Current Status */}
          <div className="mt-8 p-4 bg-blue-50 rounded-xl">
            <p className="text-sm text-gray-700">
              <strong>Saat ini:</strong> Alert Telegram sudah aktif! Guru BK akan menerima notifikasi otomatis via Telegram untuk siswa yang butuh perhatian.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
