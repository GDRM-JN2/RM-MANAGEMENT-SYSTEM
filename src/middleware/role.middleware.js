// Pemetaan role -> modul yang boleh diakses.
// HEAD_FULL_ACCESS otomatis dapat semua modul.
// Kalau nanti mau lebih fleksibel, pindahkan mapping ini ke tabel
// role_module_access di database (lihat catatan di ERD awal).
const MODULE_ACCESS = {
  HEAD_FULL_ACCESS: ['GDRM', 'BSWP', 'EKONOMIS', 'MONITORING', 'USER_MANAGEMENT'],
  ADMIN_GDRM: ['GDRM'],
  ADMIN_BSWP: ['BSWP'],
  ADMIN_EKONOMIS: ['EKONOMIS'],
};

function requireModule(moduleName) {
  return (req, res, next) => {
    const role = req.user?.role;
    const allowed = MODULE_ACCESS[role] || [];

    if (!allowed.includes(moduleName)) {
      return res.status(403).json({ error: 'Anda tidak punya akses ke modul ini' });
    }
    next();
  };
}

// Khusus aksi yang cuma boleh Head (misal approve user, assign role)
function requireHead(req, res, next) {
  if (req.user?.role !== 'HEAD_FULL_ACCESS') {
    return res.status(403).json({ error: 'Hanya Head yang boleh melakukan aksi ini' });
  }
  next();
}

module.exports = { requireModule, requireHead, MODULE_ACCESS };
