const supabase = require('../../config/supabaseClient');

// POST /gdrm/reservasi
async function create(req, res) {
  try {
    const {
      tanggal_reservasi, nama_supplier, nopol, nama_barang,
      no_po, plant_id, qty_pcs, qty_kg, file_url,
    } = req.body;

    if (!tanggal_reservasi || !nama_supplier || !nama_barang) {
      return res.status(400).json({ error: 'tanggal_reservasi, nama_supplier, dan nama_barang wajib diisi' });
    }

    const { data, error } = await supabase
      .from('gdrm_reservasi')
      .insert({
        tanggal_reservasi, nama_supplier, nopol, nama_barang,
        no_po, plant_id, qty_pcs, qty_kg, file_url,
        created_by: req.user.id,
      })
      .select()
      .single();

    if (error) throw error;
    return res.status(201).json({ data });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Gagal membuat reservasi' });
  }
}

// GET /gdrm/reservasi
async function list(req, res) {
  const { status, plant_id } = req.query;

  let query = supabase
    .from('gdrm_reservasi')
    .select('*, gdrm_master_plant(kode_plant, nama_plant)')
    .is('deleted_at', null)
    .order('created_at', { ascending: false });

  if (status) query = query.eq('status', status);
  if (plant_id) query = query.eq('plant_id', plant_id);

  const { data, error } = await query;
  if (error) {
    console.error(error);
    return res.status(500).json({ error: 'Gagal mengambil data reservasi' });
  }
  return res.json({ data });
}

// GET /gdrm/reservasi/:id
async function getById(req, res) {
  const { data, error } = await supabase
    .from('gdrm_reservasi')
    .select('*, gdrm_master_plant(kode_plant, nama_plant)')
    .eq('id', req.params.id)
    .is('deleted_at', null)
    .maybeSingle();

  if (error) {
    console.error(error);
    return res.status(500).json({ error: 'Gagal mengambil data reservasi' });
  }
  if (!data) return res.status(404).json({ error: 'Reservasi tidak ditemukan' });
  return res.json({ data });
}

// PATCH /gdrm/reservasi/:id/status
// body: { status: 'sudah_tiket' | 'approved' | 'ditolak' }
// Kalau status jadi 'approved', trigger di database otomatis bikin
// Planning + Service Level - tidak perlu ditangani manual di sini.
async function updateStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const validStatus = ['menunggu_tiket', 'sudah_tiket', 'approved', 'ditolak'];

    if (!validStatus.includes(status)) {
      return res.status(400).json({ error: `status harus salah satu dari: ${validStatus.join(', ')}` });
    }

    const updatePayload = { status };
    if (status === 'approved') {
      updatePayload.approved_by = req.user.id;
      updatePayload.approved_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('gdrm_reservasi')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return res.json({ data });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Gagal update status reservasi' });
  }
}

// DELETE /gdrm/reservasi/:id  -- soft delete, bukan hapus fisik
async function softDelete(req, res) {
  const { error } = await supabase
    .from('gdrm_reservasi')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', req.params.id);

  if (error) {
    console.error(error);
    return res.status(500).json({ error: 'Gagal menghapus reservasi' });
  }
  return res.json({ message: 'Reservasi dihapus (soft delete)' });
}

module.exports = { create, list, getById, updateStatus, softDelete };
