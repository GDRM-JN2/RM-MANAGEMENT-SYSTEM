const supabase = require('../config/supabaseClient');
const { hashPassword, comparePassword } = require('../utils/password');
const { signToken } = require('../utils/jwt');

// POST /auth/register
// User daftar sendiri -> masuk status 'pending', role_id masih NULL,
// BELUM bisa login sampai diapprove Head.
async function register(req, res) {
  try {
    const { username, password, nama_lengkap, jabatan } = req.body;

    if (!username || !password || !nama_lengkap) {
      return res.status(400).json({ error: 'username, password, dan nama_lengkap wajib diisi' });
    }
    if (password.length < 8) {
      return res.status(400).json({ error: 'Password minimal 8 karakter' });
    }

    const { data: existing } = await supabase
      .from('users')
      .select('id')
      .eq('username', username)
      .maybeSingle();

    if (existing) {
      return res.status(409).json({ error: 'Username sudah dipakai' });
    }

    const password_hash = await hashPassword(password);

    const { data, error } = await supabase
      .from('users')
      .insert({
        username,
        password_hash,
        nama_lengkap,
        jabatan: jabatan || null,
        registration_status: 'pending',
      })
      .select('id, username, nama_lengkap, registration_status')
      .single();

    if (error) throw error;

    return res.status(201).json({
      message: 'Pendaftaran berhasil, menunggu approval dari Head sebelum bisa login.',
      user: data,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Gagal mendaftar' });
  }
}

// POST /auth/login
async function login(req, res) {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'username dan password wajib diisi' });
    }

    const { data: user, error } = await supabase
      .from('users')
      .select('id, username, password_hash, nama_lengkap, status, registration_status, role_id, roles(nama_role)')
      .eq('username', username)
      .maybeSingle();

    if (error) throw error;
    if (!user) {
      return res.status(401).json({ error: 'Username atau password salah' });
    }

    if (user.registration_status === 'pending') {
      return res.status(403).json({ error: 'Akun masih menunggu approval dari Head' });
    }
    if (user.registration_status === 'ditolak') {
      return res.status(403).json({ error: 'Pendaftaran akun ini ditolak' });
    }
    if (user.status !== 'aktif') {
      return res.status(403).json({ error: 'Akun tidak aktif, hubungi admin' });
    }

    const valid = await comparePassword(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Username atau password salah' });
    }

    const token = signToken({
      id: user.id,
      username: user.username,
      role: user.roles?.nama_role || null,
    });

    return res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        nama_lengkap: user.nama_lengkap,
        role: user.roles?.nama_role || null,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Gagal login' });
  }
}

module.exports = { register, login };
