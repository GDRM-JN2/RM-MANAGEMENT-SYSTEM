const supabase = require('../../config/supabaseClient');

// GET /gdrm/service-level
async function list(req, res) {
  const { plant_id, status_approved } = req.query;

  let query = supabase
    .from('gdrm_service_level')
    .select('*, gdrm_master_plant(kode_plant, nama_plant)')
    .is('deleted_at', null)
    .order('created_at', { ascending: false });

  if (plant_id) query = query.eq('plant_id', plant_id);
  if (status_approved) query = query.eq('status_approved', status_approved);

  const { data, error } = await query;
  if (error) {
    console.error(error);
    return res.status(500).json({ error: 'Gagal mengambil data service level' });
  }
  return res.json({ data });
}

// GET /gdrm/service-level/:id
async function getById(req, res) {
  const { data, error } = await supabase
    .from('gdrm_service_level')
    .select('*, gdrm_master_plant(kode_plant, nama_plant), gdrm_reservasi(*)')
    .eq('id', req.params.id)
    .is('deleted_at', null)
    .maybeSingle();

  if (error) {
    console.error(error);
    return res.status(500).json({ error: 'Gagal mengambil data service level' });
  }
  if (!data) return res.status(404).json({ error: 'Data service level tidak ditemukan' });
  return res.json({ data });
}

// PATCH /gdrm/service-level/:id
// Untuk melengkapi data kedatangan truk yang belum terisi otomatis:
// no_ritase, jam-jam, no_batch, sku_id, dst.
// lama_bongkar_menit TIDAK perlu dikirim - dihitung otomatis oleh database.
async function update(req, res) {
  try {
    const { id } = req.params;
    const allowedFields = [
      'no_ritase', 'tanggal_kedatangan', 'tanggal_keluar',
      'jam_masuk', 'jam_pengecekan_qc', 'jam_start_bongkar',
      'jam_selesai_bongkar', 'jam_keluar', 'nopol_mobil', 'sku_id',
      'merk_rm', 'produsen', 'nomor_po', 'dokumen_gr', 'no_batch',
      'jumlah_rm', 'jumlah_berat_kg', 'nama_supplier', 'tanggal_expired',
      'keterangan', 'status_approved', 'note', 'qr_code', 'ringkasan_rm',
    ];

    const payload = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) payload[field] = req.body[field];
    }

    const { data, error } = await supabase
      .from('gdrm_service_level')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return res.json({ data });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Gagal update data service level' });
  }
}

module.exports = { list, getById, update };
