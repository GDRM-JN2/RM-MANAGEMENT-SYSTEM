const supabase = require('../config/supabaseClient');

// GET /users/pending  (khusus Head)
async function listPending(req, res) {
  const { data, error } = await supabase
    .from('users')
    .select('id, username, nama_lengkap, jabatan, created_at')
    .eq('registration_status', 'pending')
    .order('created_at', { ascending: true });

  if (error) {
    console.error(error);
    return res.status(500).json({ error: 'Gagal mengambil daftar user pending' });
  }
  return res.json({ data });
}

// POST /users/:id/approve  (khusus Head)
// body: { role_id }  -- Head yang menentukan role di sini
async function approveUser(req, res) {
  try {
    const { id } = req.params;
    const { role_id } = req.body;

    if (!role_id) {
      return res.status(400).json({ error: 'role_id wajib diisi oleh Head' });
    }

    const { data, error } = await supabase
      .from('users')
      .update({
        registration_status: 'approved',
        role_id,
        approved_by: req.user.id,
        approved_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select('id, username, registration_status, role_id')
      .single();

    if (error) throw error;

    return res.json({ message: 'User berhasil diapprove', user: data });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Gagal approve user' });
  }
}

// POST /users/:id/reject  (khusus Head)
async function rejectUser(req, res) {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('users')
      .update({
        registration_status: 'ditolak',
        approved_by: req.user.id,
        approved_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select('id, username, registration_status')
      .single();

    if (error) throw error;
    return res.json({ message: 'Pendaftaran user ditolak', user: data });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Gagal menolak user' });
  }
}

module.exports = { listPending, approveUser, rejectUser };
