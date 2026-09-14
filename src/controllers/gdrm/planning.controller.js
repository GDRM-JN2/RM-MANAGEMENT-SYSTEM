const supabase = require('../../config/supabaseClient');

// GET /gdrm/planning
async function list(req, res) {
  const { plant_id } = req.query;

  let query = supabase
    .from('gdrm_planning')
    .select('*, gdrm_master_plant(kode_plant, nama_plant), gdrm_reservasi(nama_supplier, no_po)')
    .is('deleted_at', null)
    .order('created_at', { ascending: false });

  if (plant_id) query = query.eq('plant_id', plant_id);

  const { data, error } = await query;
  if (error) {
    console.error(error);
    return res.status(500).json({ error: 'Gagal mengambil data planning' });
  }
  return res.json({ data });
}

// GET /gdrm/planning/:id
async function getById(req, res) {
  const { data, error } = await supabase
    .from('gdrm_planning')
    .select('*, gdrm_master_plant(kode_plant, nama_plant), gdrm_reservasi(*)')
    .eq('id', req.params.id)
    .is('deleted_at', null)
    .maybeSingle();

  if (error) {
    console.error(error);
    return res.status(500).json({ error: 'Gagal mengambil data planning' });
  }
  if (!data) return res.status(404).json({ error: 'Data planning tidak ditemukan' });
  return res.json({ data });
}

// PATCH /gdrm/planning/:id
// Untuk melengkapi data yang belum terisi otomatis dari Reservasi:
// kode_material, keterangan, konfirmasi_qty_kg, konfirmasi_tanggal_kirim
async function update(req, res) {
  try {
    const { id } = req.params;
    const {
      kode_material, nama_barang, supplier, no_po, plant_id,
      qty_pcs, qty_kg, keterangan,
      konfirmasi_qty_kg, konfirmasi_tanggal_kirim,
    } = req.body;

    const { data, error } = await supabase
      .from('gdrm_planning')
      .update({
        kode_material, nama_barang, supplier, no_po, plant_id,
        qty_pcs, qty_kg, keterangan,
        konfirmasi_qty_kg, konfirmasi_tanggal_kirim,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return res.json({ data });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Gagal update data planning' });
  }
}

module.exports = { list, getById, update };
