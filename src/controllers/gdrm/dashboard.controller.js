const supabase = require('../../config/supabaseClient');

// GET /gdrm/monitoring/summary
async function getSummary(req, res) {
  const { data, error } = await supabase
    .from('gdrm_dashboard_summary')
    .select('*')
    .order('kode_plant', { ascending: true });

  if (error) {
    console.error(error);
    return res.status(500).json({ error: 'Gagal mengambil ringkasan dashboard' });
  }

  // Hitung total gabungan semua plant sekaligus, biar frontend
  // tidak perlu jumlahkan manual.
  const totalGabungan = data.reduce(
    (acc, row) => {
      acc.total_reservasi += row.total_reservasi || 0;
      acc.reservasi_menunggu_tiket += row.reservasi_menunggu_tiket || 0;
      acc.reservasi_sudah_tiket += row.reservasi_sudah_tiket || 0;
      acc.reservasi_approved += row.reservasi_approved || 0;
      acc.reservasi_ditolak += row.reservasi_ditolak || 0;
      acc.total_planning += row.total_planning || 0;
      acc.total_service_level += row.total_service_level || 0;
      acc.service_level_approved += row.service_level_approved || 0;
      acc.service_level_menunggu += row.service_level_menunggu || 0;
      return acc;
    },
    {
      total_reservasi: 0, reservasi_menunggu_tiket: 0, reservasi_sudah_tiket: 0,
      reservasi_approved: 0, reservasi_ditolak: 0, total_planning: 0,
      total_service_level: 0, service_level_approved: 0, service_level_menunggu: 0,
    }
  );

  return res.json({
    per_plant: data,
    total_gabungan: totalGabungan,
  });
}

module.exports = { getSummary };
