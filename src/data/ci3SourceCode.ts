export interface CI3CodeFile {
  path: string;
  name: string;
  type: 'controller' | 'model' | 'view' | 'config' | 'sql';
  description: string;
  code: string;
}

export const CI3_SOURCE_FILES: CI3CodeFile[] = [
  {
    path: 'application/controllers/Dosen.php',
    name: 'Dosen.php',
    type: 'controller',
    description: 'Controller CodeIgniter 3 untuk CRUD Data Dosen Kimia, manajemen kuota bimbingan & validasi form',
    code: `<?php
defined('BASEPATH') OR exit('No direct script access allowed');

/**
 * Controller Dosen - SIKMA Kimia FMIPA Universitas Brawijaya
 * CodeIgniter 3.1.x Framework
 * Mengelola Manajemen Data Dosen, KBK Kimia, Kuota Bimbingan, dan Verifikasi
 */
class Dosen extends CI_Controller {

    public function __construct() {
        parent::__construct();
        // Load model, form_validation, and database
        $this->load->model('M_dosen');
        $this->load->library('form_validation');
        $this->load->library('session');
        $this->load->helper(array('url', 'form'));

        // Cek autentikasi session
        if (!$this->session->userdata('logged_in')) {
            // redirect('auth/login');
        }
    }

    /**
     * Tampilkan daftar seluruh dosen Kimia FMIPA UB
     */
    public function index() {
        $bidang = $this->input->get('bidang');
        $keyword = $this->input->get('keyword');

        $data['title'] = 'Manajemen Data Dosen - SIKMA Kimia UB';
        $data['user'] = $this->session->userdata();
        $data['list_bidang'] = array('Kimia Organik', 'Kimia Anorganik', 'Kimia Analitik', 'Kimia Fisik', 'Biokimia');
        $data['dosen'] = $this->M_dosen->get_all_dosen($bidang, $keyword);
        $data['statistik'] = $this->M_dosen->get_statistik_dosen();

        // Render views AdminLTE / SIKMA Theme
        $this->load->view('layout/header', $data);
        $this->load->view('layout/sidebar', $data);
        $this->load->view('dosen/index', $data);
        $this->load->view('layout/footer');
    }

    /**
     * Tambah data dosen baru
     */
    public function tambah() {
        $this->form_validation->set_rules('nip', 'NIP', 'required|numeric|is_unique[tb_dosen.nip]');
        $this->form_validation->set_rules('nidn', 'NIDN', 'required|numeric');
        $this->form_validation->set_rules('nama', 'Nama Lengkap', 'required|trim');
        $this->form_validation->set_rules('gelar', 'Gelar Akademik', 'required|trim');
        $this->form_validation->set_rules('bidang', 'Bidang Keahlian Kimia', 'required');
        $this->form_validation->set_rules('email', 'Email UB', 'required|valid_email');
        $this->form_validation->set_rules('kuota_bimbingan', 'Kuota Bimbingan', 'required|integer');

        if ($this->form_validation->run() === FALSE) {
            $data['title'] = 'Tambah Data Dosen - SIKMA Kimia UB';
            $this->load->view('layout/header', $data);
            $this->load->view('layout/sidebar', $data);
            $this->load->view('dosen/v_tambah', $data);
            $this->load->view('layout/footer');
        } else {
            $insert_data = array(
                'nip'              => $this->input->post('nip', TRUE),
                'nidn'             => $this->input->post('nidn', TRUE),
                'nama'             => $this->input->post('nama', TRUE),
                'gelar'            => $this->input->post('gelar', TRUE),
                'bidang'           => $this->input->post('bidang', TRUE),
                'lab_riset'        => $this->input->post('lab_riset', TRUE),
                'email'            => $this->input->post('email', TRUE),
                'jabatan_akademik' => $this->input->post('jabatan_akademik', TRUE),
                'status'           => 'Aktif Mengajar',
                'kuota_bimbingan'  => $this->input->post('kuota_bimbingan', TRUE),
                'jumlah_bimbingan' => 0,
                'ruang_kantor'     => $this->input->post('ruang_kantor', TRUE),
                'created_at'       => date('Y-m-d H:i:s')
            );

            $this->M_dosen->insert_dosen($insert_data);
            $this->session->set_flashdata('success', 'Data dosen berhasil ditambahkan ke pangkalan data Kimia UB.');
            redirect('dosen');
        }
    }

    /**
     * Edit data dosen
     */
    public function edit($id) {
        $dosen = $this->M_dosen->get_dosen_by_id($id);
        if (!$dosen) {
            show_404();
        }

        $this->form_validation->set_rules('nama', 'Nama Lengkap', 'required|trim');
        $this->form_validation->set_rules('gelar', 'Gelar', 'required');
        $this->form_validation->set_rules('kuota_bimbingan', 'Kuota Bimbingan', 'required|integer');

        if ($this->form_validation->run() === FALSE) {
            $data['title'] = 'Edit Data Dosen - SIKMA Kimia UB';
            $data['d'] = $dosen;
            $this->load->view('layout/header', $data);
            $this->load->view('layout/sidebar', $data);
            $this->load->view('dosen/v_edit', $data);
            $this->load->view('layout/footer');
        } else {
            $update_data = array(
                'nama'             => $this->input->post('nama', TRUE),
                'gelar'            => $this->input->post('gelar', TRUE),
                'bidang'           => $this->input->post('bidang', TRUE),
                'lab_riset'        => $this->input->post('lab_riset', TRUE),
                'email'            => $this->input->post('email', TRUE),
                'jabatan_akademik' => $this->input->post('jabatan_akademik', TRUE),
                'kuota_bimbingan'  => $this->input->post('kuota_bimbingan', TRUE),
                'ruang_kantor'     => $this->input->post('ruang_kantor', TRUE),
                'updated_at'       => date('Y-m-d H:i:s')
            );

            $this->M_dosen->update_dosen($id, $update_data);
            $this->session->set_flashdata('success', 'Perubahan data dosen berhasil disimpan.');
            redirect('dosen');
        }
    }

    /**
     * Hapus data dosen
     */
    public function hapus($id) {
        $this->M_dosen->delete_dosen($id);
        $this->session->set_flashdata('success', 'Data dosen telah dihapus dari sistem SIKMA.');
        redirect('dosen');
    }

    /**
     * Detail dosen beserta daftar mahasiswa bimbingan tugas akhir
     */
    public function detail($id) {
        $data['title'] = 'Detail Dosen & Beban Bimbingan - SIKMA Kimia UB';
        $data['dosen'] = $this->M_dosen->get_dosen_by_id($id);
        $data['mahasiswa_bimbingan'] = $this->M_dosen->get_mahasiswa_bimbingan($id);
        
        $this->load->view('layout/header', $data);
        $this->load->view('layout/sidebar', $data);
        $this->load->view('dosen/v_detail', $data);
        $this->load->view('layout/footer');
    }
}
`
  },
  {
    path: 'application/controllers/Akademik.php',
    name: 'Akademik.php',
    type: 'controller',
    description: 'Controller KRS, KHS, Transkrip Nilai Kimia UB, dan Persetujuan Dosen PA',
    code: `<?php
defined('BASEPATH') OR exit('No direct script access allowed');

/**
 * Controller Sistem Informasi Akademik Mahasiswa
 * SIKMA Kimia FMIPA Universitas Brawijaya
 */
class Akademik extends CI_Controller {

    public function __construct() {
        parent::__construct();
        $this->load->model('M_akademik');
        $this->load->model('M_dosen');
        $this->load->library('session');
    }

    /**
     * Halaman Kartu Rencana Studi (KRS) Mahasiswa Kimia
     */
    public function krs() {
        $nim = $this->session->userdata('nim') ? $this->session->userdata('nim') : '215090200111012';
        
        $data['title'] = 'Kartu Rencana Studi (KRS) - SIKMA Kimia UB';
        $data['mahasiswa'] = $this->M_akademik->get_mahasiswa_by_nim($nim);
        $data['krs_terpilih'] = $this->M_akademik->get_krs_mahasiswa($nim, 7);
        $data['matakuliah_tersedia'] = $this->M_akademik->get_matakuliah_semester(7);
        $data['total_sks'] = $this->M_akademik->hitung_total_sks($nim, 7);

        $this->load->view('layout/header', $data);
        $this->load->view('layout/sidebar', $data);
        $this->load->view('akademik/v_krs', $data);
        $this->load->view('layout/footer');
    }

    /**
     * Simpan mata kuliah KRS
     */
    public function simpan_krs() {
        $nim = $this->input->post('nim');
        $matakuliah_ids = $this->input->post('matakuliah_ids'); // Array ID mata kuliah

        $result = $this->M_akademik->simpan_krs_batch($nim, 7, $matakuliah_ids);
        if ($result) {
            $this->session->set_flashdata('success', 'Rencana studi semester 7 berhasil disimpan dan diteruskan ke Dosen PA.');
        } else {
            $this->session->set_flashdata('error', 'Gagal menyimpan KRS. Melebihi batas maksimal 24 SKS.');
        }
        redirect('akademik/krs');
    }

    /**
     * Kartu Hasil Studi (KHS) & Transkrip Akademik Kumulatif
     */
    public function khs() {
        $nim = $this->session->userdata('nim') ? $this->session->userdata('nim') : '215090200111012';
        
        $data['title'] = 'Kartu Hasil Studi & Transkrip - SIKMA Kimia UB';
        $data['mahasiswa'] = $this->M_akademik->get_mahasiswa_by_nim($nim);
        $data['transkrip'] = $this->M_akademik->get_transkrip_lengkap($nim);
        $data['ipk'] = $this->M_akademik->hitung_ipk($nim);

        $this->load->view('layout/header', $data);
        $this->load->view('layout/sidebar', $data);
        $this->load->view('akademik/v_khs', $data);
        $this->load->view('layout/footer');
    }
}
`
  },
  {
    path: 'application/controllers/Skripsi.php',
    name: 'Skripsi.php',
    type: 'controller',
    description: 'Controller Alur Tugas Akhir Kimia: Pengajuan Judul, Sempro, Logbook Riset Lab, dan Bebas Laboratorium',
    code: `<?php
defined('BASEPATH') OR exit('No direct script access allowed');

/**
 * Controller Manajemen Skripsi & Laboratorium Kimia UB
 * SIKMA Kimia FMIPA Universitas Brawijaya
 */
class Skripsi extends CI_Controller {

    public function __construct() {
        parent::__construct();
        $this->load->model('M_skripsi');
        $this->load->model('M_dosen');
        $this->load->library('session');
    }

    /**
     * Logbook Penelitian Laboratorium Kimia Mahasiswa
     */
    public function logbook() {
        $nim = '215090200111012'; // Sesuai session aktif
        $data['title'] = 'Logbook Penelitian Laboratorium Kimia - SIKMA UB';
        $data['logbooks'] = $this->M_skripsi->get_logbooks_by_nim($nim);
        $data['progres'] = $this->M_skripsi->get_tahap_skripsi($nim);

        $this->load->view('layout/header', $data);
        $this->load->view('layout/sidebar', $data);
        $this->load->view('skripsi/v_logbook', $data);
        $this->load->view('layout/footer');
    }

    /**
     * Tambah Catatan Logbook Lab Kimia Baru
     */
    public function tambah_logbook() {
        $data_log = array(
            'mahasiswa_id'         => $this->input->post('mahasiswa_id'),
            'tanggal'              => $this->input->post('tanggal'),
            'aktivitas'            => $this->input->post('aktivitas'),
            'lab_riset'            => $this->input->post('lab_riset'),
            'instrumen_digunakan'  => implode(', ', $this->input->post('instrumen')),
            'bahan_kimia_utama'    => $this->input->post('bahan_kimia_utama'),
            'hasil_dan_temuan'     => $this->input->post('hasil_dan_temuan'),
            'status_verifikasi'    => 'Menunggu Verifikasi',
            'created_at'           => date('Y-m-d H:i:s')
        );

        $this->M_skripsi->insert_logbook($data_log);
        $this->session->set_flashdata('success', 'Catatan logbook laboratorium berhasil dicatat. Notifikasi dikirimkan ke Dosen Pembimbing.');
        redirect('skripsi/logbook');
    }

    /**
     * Verifikasi Logbook oleh Dosen Pembimbing
     */
    public function verifikasi_logbook($id) {
        $catatan = $this->input->post('catatan_dosen');
        $status  = $this->input->post('status_verifikasi'); // Disetujui / Perlu Perbaikan

        $this->M_skripsi->update_verifikasi_logbook($id, array(
            'status_verifikasi'  => $status,
            'catatan_dosen'      => $catatan,
            'tanggal_verifikasi' => date('Y-m-d H:i:s'),
            'dosen_verifikator'  => $this->session->userdata('nama_dosen')
        ));

        $this->session->set_flashdata('success', 'Status verifikasi logbook lab telah diperbarui.');
        redirect('skripsi/logbook');
    }
}
`
  },
  {
    path: 'application/models/M_dosen.php',
    name: 'M_dosen.php',
    type: 'model',
    description: 'Active Record Model CI3 untuk query database dosen, KBK Kimia, kuota skripsi',
    code: `<?php
defined('BASEPATH') OR exit('No direct script access allowed');

/**
 * Model M_dosen - CodeIgniter 3
 * Pengelolaan entitas Dosen Departemen Kimia FMIPA Universitas Brawijaya
 */
class M_dosen extends CI_Model {

    protected $table = 'tb_dosen';

    public function __construct() {
        parent::__construct();
        $this->load->database();
    }

    /**
     * Ambil data dosen dengan filter bidang & pencarian
     */
    public function get_all_dosen($bidang = null, $keyword = null) {
        $this->db->select('*');
        $this->db->from($this->table);

        if (!empty($bidang) && $bidang != 'Semua') {
            $this->db->where('bidang', $bidang);
        }

        if (!empty($keyword)) {
            $this->db->group_start();
            $this->db->like('nama', $keyword);
            $this->db->or_like('nip', $keyword);
            $this->db->or_like('nidn', $keyword);
            $this->db->or_like('bidang', $keyword);
            $this->db->group_end();
        }

        $this->db->order_by('nama', 'ASC');
        $query = $this->db->get();
        return $query->result_array();
    }

    public function get_dosen_by_id($id) {
        return $this->db->get_where($this->table, array('id' => $id))->row_array();
    }

    public function insert_dosen($data) {
        return $this->db->insert($this->table, $data);
    }

    public function update_dosen($id, $data) {
        $this->db->where('id', $id);
        return $this->db->update($this->table, $data);
    }

    public function delete_dosen($id) {
        $this->db->where('id', $id);
        return $this->db->delete($this->table);
    }

    public function get_statistik_dosen() {
        return array(
            'total_dosen'      => $this->db->count_all($this->table),
            'organik'          => $this->db->where('bidang', 'Kimia Organik')->count_all_results($this->table),
            'anorganik'        => $this->db->where('bidang', 'Kimia Anorganik')->count_all_results($this->table),
            'analitik'         => $this->db->where('bidang', 'Kimia Analitik')->count_all_results($this->table),
            'fisik'            => $this->db->where('bidang', 'Kimia Fisik')->count_all_results($this->table),
            'biokimia'         => $this->db->where('bidang', 'Biokimia')->count_all_results($this->table)
        );
    }

    public function get_mahasiswa_bimbingan($dosen_id) {
        $this->db->select('tb_mahasiswa.*, tb_skripsi.judul, tb_skripsi.tahap');
        $this->db->from('tb_mahasiswa');
        $this->db->join('tb_skripsi', 'tb_skripsi.mahasiswa_id = tb_mahasiswa.id', 'left');
        $this->db->where('tb_mahasiswa.dosen_pembimbing1_id', $dosen_id);
        $this->db->or_where('tb_mahasiswa.dosen_pembimbing2_id', $dosen_id);
        return $this->db->get()->result_array();
    }
}
`
  },
  {
    path: 'application/models/M_akademik.php',
    name: 'M_akademik.php',
    type: 'model',
    description: 'Active Record Model CI3 untuk KRS, KHS, nilai, dan IPK mahasiswa Kimia UB',
    code: `<?php
defined('BASEPATH') OR exit('No direct script access allowed');

/**
 * Model M_akademik - CodeIgniter 3
 * Menghitung IPK, KRS, dan Matakuliah Kimia UB
 */
class M_akademik extends CI_Model {

    public function __construct() {
        parent::__construct();
        $this->load->database();
    }

    public function get_mahasiswa_by_nim($nim) {
        return $this->db->get_where('tb_mahasiswa', array('nim' => $nim))->row_array();
    }

    public function get_krs_mahasiswa($nim, $semester) {
        $this->db->select('tb_krs.*, tb_matakuliah.kode, tb_matakuliah.nama, tb_matakuliah.sks, tb_matakuliah.kbk, tb_matakuliah.jadwal, tb_matakuliah.ruang');
        $this->db->from('tb_krs');
        $this->db->join('tb_matakuliah', 'tb_matakuliah.id = tb_krs.matakuliah_id');
        $this->db->where('tb_krs.nim', $nim);
        $this->db->where('tb_krs.semester', $semester);
        return $this->db->get()->result_array();
    }

    public function get_transkrip_lengkap($nim) {
        $this->db->select('tb_nilai.*, tb_matakuliah.kode, tb_matakuliah.nama, tb_matakuliah.sks');
        $this->db->from('tb_nilai');
        $this->db->join('tb_matakuliah', 'tb_matakuliah.id = tb_nilai.matakuliah_id');
        $this->db->where('tb_nilai.nim', $nim);
        $this->db->order_by('tb_nilai.semester', 'ASC');
        return $this->db->get()->result_array();
    }

    public function hitung_ipk($nim) {
        $nilai_list = $this->get_transkrip_lengkap($nim);
        $total_bobot = 0;
        $total_sks = 0;

        foreach ($nilai_list as $n) {
            $total_bobot += ($n['nilai_angka'] * $n['sks']);
            $total_sks += $n['sks'];
        }

        return ($total_sks > 0) ? round($total_bobot / $total_sks, 2) : 0.00;
    }
}
`
  },
  {
    path: 'application/views/dosen/index.php',
    name: 'v_dosen_index.php',
    type: 'view',
    description: 'Template View CodeIgniter 3 dengan tabel interaktif AdminLTE / Bootstrap 4',
    code: `<!-- Main content wrapper SIKMA Kimia UB -->
<div class="content-wrapper">
    <section class="content-header">
        <h1>
            <i class="fa fa-graduation-cap text-primary"></i> Data Dosen & Penasihat Akademik
            <small>Departemen Kimia FMIPA Universitas Brawijaya</small>
        </h1>
        <ol class="breadcrumb">
            <li><a href="<?php echo site_url('dashboard'); ?>"><i class="fa fa-dashboard"></i> Home</a></li>
            <li class="active">Data Dosen</li>
        </ol>
    </section>

    <!-- Main content -->
    <section class="content">
        <!-- Flash message session CI3 -->
        <?php if($this->session->flashdata('success')): ?>
            <div class="alert alert-success alert-dismissible">
                <button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button>
                <h4><i class="icon fa fa-check"></i> Berhasil!</h4>
                <?php echo $this->session->flashdata('success'); ?>
            </div>
        <?php endif; ?>

        <!-- Filter Box -->
        <div class="box box-primary">
            <div class="box-header with-border">
                <h3 class="box-title"><i class="fa fa-filter"></i> Filter Kelompok Bidang Keahlian (KBK)</h3>
                <div class="box-tools pull-right">
                    <a href="<?php echo site_url('dosen/tambah'); ?>" class="btn btn-sm btn-primary">
                        <i class="fa fa-plus-circle"></i> Tambah Dosen Baru
                    </a>
                </div>
            </div>
            <div class="box-body">
                <form action="<?php echo site_url('dosen'); ?>" method="GET" class="form-inline">
                    <div class="form-group">
                        <label>Bidang Keahlian: </label>
                        <select name="bidang" class="form-control" onchange="this.form.submit()">
                            <option value="Semua">-- Semua Bidang Keahlian Kimia --</option>
                            <?php foreach($list_bidang as $b): ?>
                                <option value="<?php echo $b; ?>" <?php echo ($this->input->get('bidang') == $b) ? 'selected' : ''; ?>>
                                    <?php echo $b; ?>
                                </option>
                            <?php endforeach; ?>
                        </select>
                    </div>
                </form>
            </div>
        </div>

        <!-- Data Table -->
        <div class="box box-info">
            <div class="box-header with-border">
                <h3 class="box-title">Daftar Tenaga Pendidik & Kuota Bimbingan Skripsi</h3>
            </div>
            <div class="box-body table-responsive">
                <table id="tabelDosen" class="table table-bordered table-striped table-hover">
                    <thead style="background-color: #002B49; color: #FFFFFF;">
                        <tr>
                            <th style="width: 5%">No</th>
                            <th>NIP / NIDN</th>
                            <th>Nama Dosen & Gelar</th>
                            <th>Bidang Keahlian (KBK)</th>
                            <th>Laboratorium Riset</th>
                            <th>Status Kuota Bimbingan</th>
                            <th style="width: 15%">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php $no = 1; foreach($dosen as $row): ?>
                        <tr>
                            <td><?php echo $no++; ?></td>
                            <td>
                                <strong><?php echo $row['nip']; ?></strong><br>
                                <span class="text-muted">NIDN: <?php echo $row['nidn']; ?></span>
                            </td>
                            <td>
                                <strong class="text-primary"><?php echo $row['nama'] . ', ' . $row['gelar']; ?></strong><br>
                                <i class="fa fa-envelope text-muted"></i> <?php echo $row['email']; ?>
                            </td>
                            <td><span class="label label-info"><?php echo $row['bidang']; ?></span></td>
                            <td><?php echo $row['lab_riset']; ?></td>
                            <td>
                                <span class="badge bg-green"><?php echo $row['jumlah_bimbingan']; ?> / <?php echo $row['kuota_bimbingan']; ?> Mahasiswa</span>
                            </td>
                            <td>
                                <a href="<?php echo site_url('dosen/detail/'.$row['id']); ?>" class="btn btn-xs btn-info" title="Detail"><i class="fa fa-eye"></i></a>
                                <a href="<?php echo site_url('dosen/edit/'.$row['id']); ?>" class="btn btn-xs btn-warning" title="Edit"><i class="fa fa-pencil"></i></a>
                                <a href="<?php echo site_url('dosen/hapus/'.$row['id']); ?>" class="btn btn-xs btn-danger" onclick="return confirm('Apakah Anda yakin ingin menghapus data dosen ini?');" title="Hapus"><i class="fa fa-trash"></i></a>
                            </td>
                        </tr>
                        <?php endforeach; ?>
                    </tbody>
                </table>
            </div>
        </div>
    </section>
</div>
`
  },
  {
    path: 'application/config/database.php',
    name: 'database.php',
    type: 'config',
    description: 'Konfigurasi koneksi MySQL Database CodeIgniter 3 untuk SIKMA Kimia UB',
    code: `<?php
defined('BASEPATH') OR exit('No direct script access allowed');

$active_group = 'default';
$query_builder = TRUE;

$db['default'] = array(
	'dsn'	   => '',
	'hostname' => 'localhost',
	'username' => 'sikma_user',
	'password' => 'BrawijayaKimia2026!',
	'database' => 'db_sikma_kimia_ub',
	'dbdriver' => 'mysqli',
	'dbprefix' => '',
	'pconnect' => FALSE,
	'db_debug' => (ENVIRONMENT !== 'production'),
	'cache_on' => FALSE,
	'cachedir' => '',
	'char_set' => 'utf8mb4',
	'dbcollat' => 'utf8mb4_unicode_ci',
	'swap_pre' => '',
	'encrypt'  => FALSE,
	'compress' => FALSE,
	'stricton' => FALSE,
	'failover' => array(),
	'save_queries' => TRUE
);
`
  },
  {
    path: 'database/db_sikma_kimia_ub.sql',
    name: 'db_sikma_kimia_ub.sql',
    type: 'sql',
    description: 'Skema Database Relasional MySQL / MariaDB untuk SIKMA Kimia FMIPA Universitas Brawijaya',
    code: `-- ==========================================================
-- Skema Database Sistem Informasi Kegiatan Mahasiswa & Akademik
-- SIKMA KIMIA UB (Departemen Kimia FMIPA Universitas Brawijaya)
-- ==========================================================

CREATE DATABASE IF NOT EXISTS \`db_sikma_kimia_ub\` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE \`db_sikma_kimia_ub\`;

-- 1. Tabel Dosen Kimia
CREATE TABLE IF NOT EXISTS \`tb_dosen\` (
  \`id\` INT(11) NOT NULL AUTO_INCREMENT,
  \`nip\` VARCHAR(20) NOT NULL UNIQUE,
  \`nidn\` VARCHAR(20) NOT NULL,
  \`nama\` VARCHAR(150) NOT NULL,
  \`gelar\` VARCHAR(50) NOT NULL,
  \`bidang\` ENUM('Kimia Organik','Kimia Anorganik','Kimia Analitik','Kimia Fisik','Biokimia') NOT NULL,
  \`lab_riset\` VARCHAR(150) NOT NULL,
  \`email\` VARCHAR(100) NOT NULL,
  \`jabatan_akademik\` VARCHAR(50) NOT NULL DEFAULT 'Lektor',
  \`status\` VARCHAR(50) NOT NULL DEFAULT 'Aktif Mengajar',
  \`kuota_bimbingan\` INT(3) NOT NULL DEFAULT 8,
  \`jumlah_bimbingan\` INT(3) NOT NULL DEFAULT 0,
  \`ruang_kantor\` VARCHAR(100),
  \`telepon\` VARCHAR(30),
  \`created_at\` DATETIME DEFAULT CURRENT_TIMESTAMP,
  \`updated_at\` DATETIME DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Tabel Mahasiswa
CREATE TABLE IF NOT EXISTS \`tb_mahasiswa\` (
  \`id\` INT(11) NOT NULL AUTO_INCREMENT,
  \`nim\` VARCHAR(20) NOT NULL UNIQUE,
  \`nama\` VARCHAR(150) NOT NULL,
  \`angkatan\` VARCHAR(4) NOT NULL,
  \`program_studi\` VARCHAR(100) DEFAULT 'S1 Kimia',
  \`dosen_pa_id\` INT(11) NULL,
  \`status\` ENUM('Aktif','Cuti','Lulus') DEFAULT 'Aktif',
  \`semester\` INT(2) DEFAULT 1,
  \`ipk\` DECIMAL(3,2) DEFAULT 0.00,
  \`total_sks\` INT(3) DEFAULT 0,
  \`judul_skripsi\` TEXT NULL,
  \`dosen_pembimbing1_id\` INT(11) NULL,
  \`dosen_pembimbing2_id\` INT(11) NULL,
  \`tahap_skripsi\` VARCHAR(50) DEFAULT 'Belum Mengambil',
  PRIMARY KEY (\`id\`),
  KEY \`fk_dosen_pa\` (\`dosen_pa_id\`),
  CONSTRAINT \`fk_mhs_dosen_pa\` FOREIGN KEY (\`dosen_pa_id\`) REFERENCES \`tb_dosen\` (\`id\`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Tabel Logbook Penelitian Laboratorium Kimia
CREATE TABLE IF NOT EXISTS \`tb_logbook_lab\` (
  \`id\` INT(11) NOT NULL AUTO_INCREMENT,
  \`mahasiswa_id\` INT(11) NOT NULL,
  \`tanggal\` DATE NOT NULL,
  \`aktivitas\` TEXT NOT NULL,
  \`lab_riset\` VARCHAR(150) NOT NULL,
  \`instrumen_digunakan\` VARCHAR(255) NULL,
  \`bahan_kimia_utama\` TEXT NULL,
  \`hasil_dan_temuan\` TEXT NOT NULL,
  \`catatan_dosen\` TEXT NULL,
  \`status_verifikasi\` ENUM('Menunggu Verifikasi','Disetujui','Perlu Perbaikan') DEFAULT 'Menunggu Verifikasi',
  \`dosen_verifikator\` VARCHAR(150) NULL,
  \`tanggal_verifikasi\` DATETIME NULL,
  PRIMARY KEY (\`id\`),
  KEY \`fk_logbook_mhs\` (\`mahasiswa_id\`),
  CONSTRAINT \`fk_logbook_mhs\` FOREIGN KEY (\`mahasiswa_id\`) REFERENCES \`tb_mahasiswa\` (\`id\`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Tabel Bebas Laboratorium Kimia
CREATE TABLE IF NOT EXISTS \`tb_bebas_lab\` (
  \`id\` INT(11) NOT NULL AUTO_INCREMENT,
  \`mahasiswa_id\` INT(11) NOT NULL,
  \`alat_kimia_lengkap\` TINYINT(1) DEFAULT 0,
  \`bebas_ganti_pecah\` TINYINT(1) DEFAULT 0,
  \`limbah_b3_dibersihkan\` TINYINT(1) DEFAULT 0,
  \`logbook_disetujui\` TINYINT(1) DEFAULT 0,
  \`status_bebas\` ENUM('Belum Lengkap','Terverifikasi Laboran','Disahkan Kepala Lab') DEFAULT 'Belum Lengkap',
  PRIMARY KEY (\`id\`),
  CONSTRAINT \`fk_bebas_lab_mhs\` FOREIGN KEY (\`mahasiswa_id\`) REFERENCES \`tb_mahasiswa\` (\`id\`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. Tabel Kegiatan Mahasiswa di Luar Kampus (KLK / MBKM)
CREATE TABLE IF NOT EXISTS \`tb_klk_pengajuan\` (
  \`id\` INT(11) NOT NULL AUTO_INCREMENT,
  \`kode_pendaftaran\` VARCHAR(30) NOT NULL UNIQUE,
  \`mahasiswa_id\` INT(11) NOT NULL,
  \`skema\` VARCHAR(100) NOT NULL,
  \`nama_semester\` VARCHAR(50) NOT NULL DEFAULT 'Ganjil 2026 / 2027',
  \`nama_mitra\` VARCHAR(200) NOT NULL,
  \`alamat_mitra\` TEXT NULL,
  \`bidang_pekerjaan\` TEXT NOT NULL,
  \`mentor_industri\` VARCHAR(150) NULL,
  \`kontak_mentor\` VARCHAR(100) NULL,
  \`dosen_pembimbing_klk\` VARCHAR(150) NOT NULL,
  \`tanggal_mulai\` DATE NOT NULL,
  \`tanggal_selesai\` DATE NOT NULL,
  \`sks_diakui\` INT(2) DEFAULT 4,
  \`status\` ENUM('Diproses','Disetujui','Ditolak','Disetujui / Sedang Berjalan','Selesai & Dinilai') DEFAULT 'Diproses',
  \`nomor_surat_tugas\` VARCHAR(100) NULL,
  \`nilai_industri\` DECIMAL(5,2) NULL,
  \`nilai_dosen\` DECIMAL(5,2) NULL,
  \`nilai_akhir_huruf\` VARCHAR(2) NULL,
  PRIMARY KEY (\`id\`),
  KEY \`fk_klk_mhs\` (\`mahasiswa_id\`),
  CONSTRAINT \`fk_klk_mhs\` FOREIGN KEY (\`mahasiswa_id\`) REFERENCES \`tb_mahasiswa\` (\`id\`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. Tabel Logbook Mingguan KLK
CREATE TABLE IF NOT EXISTS \`tb_klk_logbook\` (
  \`id\` INT(11) NOT NULL AUTO_INCREMENT,
  \`klk_id\` INT(11) NOT NULL,
  \`minggu_ke\` INT(2) NOT NULL,
  \`tanggal_mulai\` DATE NOT NULL,
  \`tanggal_selesai\` DATE NOT NULL,
  \`aktivitas\` TEXT NOT NULL,
  \`alat_dan_metode\` TEXT NULL,
  \`hasil_dan_kendala\` TEXT NULL,
  \`status_verifikasi\` ENUM('Menunggu Verifikasi','Disetujui Mentor','Perlu Perbaikan') DEFAULT 'Menunggu Verifikasi',
  \`catatan_mentor\` TEXT NULL,
  PRIMARY KEY (\`id\`),
  CONSTRAINT \`fk_klk_logbook\` FOREIGN KEY (\`klk_id\`) REFERENCES \`tb_klk_pengajuan\` (\`id\`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 7. Tabel Master Data Ruangan & Fasilitas
CREATE TABLE IF NOT EXISTS \`tb_ruangan\` (
  \`id\` VARCHAR(50) NOT NULL,
  \`nama_ruangan\` VARCHAR(150) NOT NULL,
  \`keterangan\` TEXT NULL,
  \`kapasitas\` INT(4) NOT NULL DEFAULT 30,
  \`kategori\` ENUM('Umum','Lab','Khusus','Other') NOT NULL DEFAULT 'Umum',
  \`status\` ENUM('Aktif','Tidak Aktif') NOT NULL DEFAULT 'Aktif',
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
`
  },
  {
    path: 'application/controllers/Klk.php',
    name: 'Klk.php',
    type: 'controller',
    description: 'Controller CodeIgniter 3 untuk Modul KLK (Kegiatan Mahasiswa di Luar Kampus: Magang Regular, MBKM, Riset Industri)',
    code: `<?php
defined('BASEPATH') OR exit('No direct script access allowed');

/**
 * Controller KLK - SIKMA Kimia FMIPA Universitas Brawijaya
 * Framework CodeIgniter 3.1.x
 * Mengelola pendaftaran Magang Regular, MBKM Riset, verifikasi Form KLK, logbook mingguan & konversi SKS
 */
class Klk extends CI_Controller {

    public function __construct() {
        parent::__construct();
        $this->load->model('M_klk');
        $this->load->library('form_validation');
        $this->load->library('session');
        $this->load->helper(array('url', 'form', 'download'));
    }

    /**
     * Dashboard utama modul KLK
     */
    public function index() {
        $data['title'] = 'KLK - Kegiatan Mahasiswa di Luar Kampus | SIKMA Kimia UB';
        $data['pengajuan'] = $this->M_klk->get_all_pengajuan();
        $data['mitra'] = $this->M_klk->get_mitra_industri();
        $data['statistik'] = $this->M_klk->get_statistik_klk();

        $this->load->view('layout/header', $data);
        $this->load->view('layout/sidebar', $data);
        $this->load->view('klk/index', $data);
        $this->load->view('layout/footer');
    }

    /**
     * Pendaftaran KLK Baru (Magang Regular, MBKM, Riset BRIN)
     */
    public function daftar() {
        $this->form_validation->set_rules('skema', 'Skema KLK', 'required');
        $this->form_validation->set_rules('nama_semester', 'Semester Pelaksanaan', 'required|trim');
        $this->form_validation->set_rules('status', 'Status Awal Usulan', 'required|in_list[Diproses,Disetujui,Ditolak]');
        $this->form_validation->set_rules('nama_mitra', 'Nama Instansi Mitra', 'required|trim');
        $this->form_validation->set_rules('bidang_pekerjaan', 'Bidang Pekerjaan', 'required|trim');
        $this->form_validation->set_rules('tanggal_mulai', 'Tanggal Mulai', 'required');
        $this->form_validation->set_rules('tanggal_selesai', 'Tanggal Selesai', 'required');
        $this->form_validation->set_rules('sks_diakui', 'Beban SKS', 'required|numeric');

        if ($this->form_validation->run() == FALSE) {
            $this->session->set_flashdata('error', validation_errors());
            redirect('klk');
        } else {
            $kode_pendaftaran = 'KLK-KIM-' . date('Y') . '-' . sprintf("%04d", rand(1, 9999));
            $params = array(
                'kode_pendaftaran' => $kode_pendaftaran,
                'mahasiswa_id'     => $this->session->userdata('mahasiswa_id'),
                'nama_semester'    => $this->input->post('nama_semester', TRUE),
                'skema'            => $this->input->post('skema', TRUE),
                'nama_mitra'       => $this->input->post('nama_mitra', TRUE),
                'alamat_mitra'     => $this->input->post('alamat_mitra', TRUE),
                'bidang_pekerjaan' => $this->input->post('bidang_pekerjaan', TRUE),
                'mentor_industri'  => $this->input->post('mentor_industri', TRUE),
                'kontak_mentor'    => $this->input->post('kontak_mentor', TRUE),
                'dosen_pembimbing_klk' => $this->input->post('dosen_pembimbing_klk', TRUE),
                'tanggal_mulai'    => $this->input->post('tanggal_mulai', TRUE),
                'tanggal_selesai'  => $this->input->post('tanggal_selesai', TRUE),
                'sks_diakui'       => (int) $this->input->post('sks_diakui', TRUE),
                'status'           => $this->input->post('status', TRUE) ? $this->input->post('status', TRUE) : 'Diproses'
            );

            // Upload LoA jika ada
            if (!empty($_FILES['dokumen_loa']['name'])) {
                $config['upload_path']   = './uploads/klk_loa/';
                $config['allowed_types'] = 'pdf|doc|docx';
                $config['max_size']      = 5120; // 5MB
                $this->load->library('upload', $config);
                if ($this->upload->do_upload('dokumen_loa')) {
                    $upload_data = $this->upload->data();
                    $params['dokumen_loa'] = $upload_data['file_name'];
                }
            }

            $this->M_klk->insert_pengajuan($params);
            $this->session->set_flashdata('success', 'Pendaftaran KLK berhasil disimpan. Silakan cetak Form KLK untuk pengesahan.');
            redirect('klk/cetak_form/' . $kode_pendaftaran);
        }
    }

    /**
     * Cetak Form KLK (Bukti Rencana Studi resmi Departemen Kimia UB)
     */
    public function cetak_form($kode) {
        $data['klk'] = $this->M_klk->get_by_kode($kode);
        if (!$data['klk']) {
            show_404();
        }
        $data['kop_surat'] = 'DEPARTEMEN KIMIA - FAKULTAS MIPA UNIVERSITAS BRAWIJAYA';
        $this->load->view('klk/v_cetak_form_klk', $data);
    }

    /**
     * Tambah logbook mingguan KLK
     */
    public function submit_logbook() {
        $klk_id = $this->input->post('klk_id', TRUE);
        $data_log = array(
            'klk_id'           => $klk_id,
            'minggu_ke'        => $this->input->post('minggu_ke', TRUE),
            'tanggal_mulai'    => $this->input->post('tanggal_mulai', TRUE),
            'tanggal_selesai'  => $this->input->post('tanggal_selesai', TRUE),
            'aktivitas'        => $this->input->post('aktivitas', TRUE),
            'alat_dan_metode'  => $this->input->post('alat_dan_metode', TRUE),
            'hasil_dan_kendala'=> $this->input->post('hasil_dan_kendala', TRUE),
            'status_verifikasi'=> 'Menunggu Verifikasi'
        );
        $this->M_klk->insert_logbook($data_log);
        $this->session->set_flashdata('success', 'Logbook mingguan berhasil terkirim.');
        redirect('klk/detail/' . $klk_id);
    }
}
`
  },
  {
    path: 'application/models/M_klk.php',
    name: 'M_klk.php',
    type: 'model',
    description: 'Model CodeIgniter 3 untuk query data KLK, logbook mingguan, daftar mitra kimia, dan konversi SKS',
    code: `<?php
defined('BASEPATH') OR exit('No direct script access allowed');

/**
 * Model M_klk - SIKMA Kimia FMIPA Universitas Brawijaya
 * Interaksi tabel tb_klk_pengajuan, tb_klk_logbook, dan tb_mitra_industri
 */
class M_klk extends CI_Model {

    public function __construct() {
        parent::__construct();
        $this->load->database();
    }

    public function get_all_pengajuan($skema = null, $status = null) {
        $this->db->select('k.*, m.nama as mahasiswa_nama, m.nim, m.semester, m.dosen_pa_id');
        $this->db->from('tb_klk_pengajuan k');
        $this->db->join('tb_mahasiswa m', 'm.id = k.mahasiswa_id', 'left');
        if ($skema && $skema != 'Semua') {
            $this->db->where('k.skema', $skema);
        }
        if ($status && $status != 'Semua') {
            $this->db->where('k.status', $status);
        }
        $this->db->order_by('k.id', 'DESC');
        return $this->db->get()->result_array();
    }

    public function get_by_kode($kode) {
        $this->db->select('k.*, m.nama as mahasiswa_nama, m.nim, m.semester');
        $this->db->from('tb_klk_pengajuan k');
        $this->db->join('tb_mahasiswa m', 'm.id = k.mahasiswa_id', 'left');
        $this->db->where('k.kode_pendaftaran', $kode);
        return $this->db->get()->row_array();
    }

    public function insert_pengajuan($data) {
        return $this->db->insert('tb_klk_pengajuan', $data);
    }

    public function insert_logbook($data) {
        return $this->db->insert('tb_klk_logbook', $data);
    }

    public function get_logbooks($klk_id) {
        return $this->db->where('klk_id', $klk_id)
                        ->order_by('minggu_ke', 'ASC')
                        ->get('tb_klk_logbook')
                        ->result_array();
    }

    public function get_mitra_industri() {
        return $this->db->get('tb_mitra_industri')->result_array();
    }

    public function get_statistik_klk() {
        return array(
            'total'   => $this->db->count_all('tb_klk_pengajuan'),
            'aktif'   => $this->db->where('status', 'Disetujui / Sedang Berjalan')->count_all_results('tb_klk_pengajuan'),
            'pending' => $this->db->where('status', 'Menunggu Persetujuan Dept')->count_all_results('tb_klk_pengajuan'),
            'selesai' => $this->db->where('status', 'Selesai & Dinilai')->count_all_results('tb_klk_pengajuan')
        );
    }
}
`
  },
  {
    path: 'application/controllers/Auth.php',
    name: 'Auth.php',
    type: 'controller',
    description: 'Controller Autentikasi CodeIgniter 3 untuk Login Multi-Role (Super Admin, Admin, Dosen, Mahasiswa) dengan Session UB',
    code: `<?php
defined('BASEPATH') OR exit('No direct script access allowed');

/**
 * Controller Auth - SIKMA Kimia FMIPA Universitas Brawijaya
 * Framework CodeIgniter 3.1.x
 * Menangani otentikasi login multi-role (super_admin, admin, dosen, mahasiswa) & manajemen sesi
 */
class Auth extends CI_Controller {

    public function __construct() {
        parent::__construct();
        $this->load->model('M_auth');
        $this->load->library('form_validation');
        $this->load->library('session');
        $this->load->helper(array('url', 'form'));
    }

    public function index() {
        if ($this->session->userdata('logged_in')) {
            redirect('dashboard');
        }
        $data['title'] = 'Login SIKMA - Departemen Kimia FMIPA Universitas Brawijaya';
        $this->load->view('auth/login', $data);
    }

    public function proses_login() {
        $this->form_validation->set_rules('username', 'Username / NIM / NIP', 'required|trim');
        $this->form_validation->set_rules('password', 'Kata Sandi', 'required');
        $this->form_validation->set_rules('role', 'Peran Akun', 'required|in_list[super_admin,admin,dosen,mahasiswa]');

        if ($this->form_validation->run() == FALSE) {
            $this->session->set_flashdata('error', validation_errors());
            redirect('auth');
        } else {
            $username = $this->input->post('username', TRUE);
            $password = $this->input->post('password', TRUE);
            $role     = $this->input->post('role', TRUE);

            $user = $this->M_auth->verify_user($username, $password, $role);

            if ($user) {
                $session_data = array(
                    'user_id'    => $user['id'],
                    'username'   => $user['username'],
                    'nama'       => $user['nama'],
                    'role'       => $user['role'],
                    'identifier' => $user['identifier'],
                    'email'      => $user['email'],
                    'logged_in'  => TRUE
                );
                $this->session->set_userdata($session_data);
                $this->session->set_flashdata('success', 'Selamat datang kembali, ' . $user['nama']);
                redirect('dashboard');
            } else {
                $this->session->set_flashdata('error', 'Kombinasi Username/NIM/NIP, Password, atau Peran Akun tidak cocok.');
                redirect('auth');
            }
        }
    }

    public function logout() {
        $this->session->sess_destroy();
        redirect('auth');
    }
}
`
  },
  {
    path: 'application/controllers/Config.php',
    name: 'Config.php',
    type: 'controller',
    description: 'Controller Menu Config CodeIgniter 3 - Pengelolaan Pengguna (User Management), Peran (Role), dan Kebijakan Akses SIKMA UB',
    code: `<?php
defined('BASEPATH') OR exit('No direct script access allowed');

/**
 * Controller Config (User Management & RBAC)
 * SIKMA Kimia FMIPA Universitas Brawijaya (CI 3.1.x)
 * Rute: /config/user
 */
class Config extends CI_Controller {

    public function __construct() {
        parent::__construct();
        $this->load->model('M_user');
        $this->load->library('session');
        $this->load->library('form_validation');
        $this->load->helper(array('url', 'form'));

        // Proteksi Auth: Hanya Super Admin & Admin Jurusan yang dapat mengakses menu Config
        if (!$this->session->userdata('logged_in')) {
            redirect('auth');
        }
        $role = $this->session->userdata('role');
        if (!in_array($role, array('super_admin', 'admin'))) {
            show_error('Akses Ditolak: Anda tidak memiliki wewenang mengakses menu Config.', 403, '403 Forbidden');
        }
    }

    public function index() {
        redirect('config/user');
    }

    /**
     * Menu Config > User: Menampilkan daftar seluruh pengguna & matriks RBAC
     */
    public function user() {
        $data['title'] = 'Config / User - Manajemen Pengguna SIKMA Kimia UB';
        $data['user_list'] = $this->M_user->get_all_users();
        $data['total_users'] = count($data['user_list']);
        
        $this->load->view('templates/header', $data);
        $this->load->view('templates/sidebar', $data);
        $this->load->view('config/user_view', $data);
        $this->load->view('templates/footer');
    }

    /**
     * Tambah Pengguna Baru
     */
    public function tambah_user() {
        $this->form_validation->set_rules('username', 'Username', 'required|is_unique[tb_users.username]');
        $this->form_validation->set_rules('nama', 'Nama Lengkap', 'required');
        $this->form_validation->set_rules('role', 'Peran (Role)', 'required|in_list[super_admin,admin,dosen,mahasiswa]');
        $this->form_validation->set_rules('identifier', 'NIM / NIP', 'required');
        $this->form_validation->set_rules('email', 'Email UB', 'required|valid_email');

        if ($this->form_validation->run() == FALSE) {
            $this->session->set_flashdata('error', validation_errors());
        } else {
            $data = array(
                'username'   => $this->input->post('username', TRUE),
                'nama'       => $this->input->post('nama', TRUE),
                'role'       => $this->input->post('role', TRUE),
                'identifier' => $this->input->post('identifier', TRUE),
                'email'      => $this->input->post('email', TRUE),
                'unit'       => $this->input->post('unit', TRUE),
                'status'     => 'Aktif',
                'created_at' => date('Y-m-d H:i:s')
            );
            $this->M_user->insert_user($data);
            $this->session->set_flashdata('success', 'User baru berhasil didaftarkan ke sistem SIKMA.');
        }
        redirect('config/user');
    }

    /**
     * Ubah status aktif / nonaktif
     */
    public function toggle_status($id) {
        $this->M_user->toggle_status($id);
        $this->session->set_flashdata('success', 'Status user berhasil diperbarui.');
        redirect('config/user');
    }

    /**
     * Menu Config > Semester: Manajemen Periode Semester Akademik
     * Rentang: Ganjil 2023 / 2024 s.d. Ganjil 2030 / 2031 (Input Ketikan Manual)
     */
    public function semester() {
        $data['title'] = 'Config / Semester - Manajemen Periode Semester SIKMA Kimia UB';
        $data['semester_list'] = $this->db->order_by('id', 'ASC')->get('tb_semester')->result_array();
        
        $this->load->view('templates/header', $data);
        $this->load->view('templates/sidebar', $data);
        $this->load->view('config/semester_view', $data);
        $this->load->view('templates/footer');
    }

    /**
     * Simpan Input Manual Nama Semester
     */
    public function simpan_semester() {
        $this->form_validation->set_rules('nama_semester', 'Nama Semester', 'required|trim');
        $this->form_validation->set_rules('tahun_ajaran', 'Tahun Ajaran', 'required|trim');
        $this->form_validation->set_rules('tipe', 'Tipe Semester', 'required|in_list[Ganjil,Genap,Antara]');

        if ($this->form_validation->run() == FALSE) {
            $this->session->set_flashdata('error', validation_errors());
        } else {
            $nama_semester = $this->input->post('nama_semester', TRUE);
            $status = $this->input->post('status', TRUE);

            // Jika diset Aktif, nonaktifkan semester lainnya
            if ($status === 'Aktif') {
                $this->db->update('tb_semester', array('status' => 'Arsip'));
            }

            $data = array(
                'nama_semester'   => $nama_semester, // Input ketikan manual (contoh: Ganjil 2023 / 2024)
                'tahun_ajaran'    => $this->input->post('tahun_ajaran', TRUE),
                'tipe'            => $this->input->post('tipe', TRUE),
                'status'          => $status,
                'tanggal_mulai'   => $this->input->post('tanggal_mulai', TRUE),
                'tanggal_selesai' => $this->input->post('tanggal_selesai', TRUE),
                'keterangan'      => $this->input->post('keterangan', TRUE),
                'created_at'      => date('Y-m-d H:i:s')
            );

            $this->db->insert('tb_semester', $data);
            $this->session->set_flashdata('success', 'Semester "' . $nama_semester . '" berhasil disimpan.');
        }
        redirect('config/semester');
    }

    /**
     * Menu Config > Jajaran: Struktur Organisasi Pimpinan Departemen Kimia FMIPA UB
     * Menampilkan Jabatan & Nama Pejabat (Kadep, Sekdep, KPS S1, KPS S2, KPS S3)
     */
    public function jajaran() {
        $data['title'] = 'Config / Jajaran - Struktur Jajaran Pimpinan Departemen Kimia FMIPA UB';
        $data['jajaran_list'] = $this->db->order_by('id', 'ASC')->get('tb_jajaran_pejabat')->result_array();
        
        $this->load->view('templates/header', $data);
        $this->load->view('templates/sidebar', $data);
        $this->load->view('config/jajaran_view', $data);
        $this->load->view('templates/footer');
    }

    /**
     * CRUD Edit Data Jabatan & Nama Pejabat
     */
    public function simpan_pejabat($id = null) {
        $this->form_validation->set_rules('jabatan', 'Nama Jabatan', 'required|trim');
        $this->form_validation->set_rules('nama_pejabat', 'Nama Pejabat', 'required|trim');

        if ($this->form_validation->run() == FALSE) {
            $this->session->set_flashdata('error', validation_errors());
        } else {
            $data = array(
                'jabatan'         => $this->input->post('jabatan', TRUE),
                'nama_pejabat'    => $this->input->post('nama_pejabat', TRUE),
                'nip'             => $this->input->post('nip', TRUE),
                'email'           => $this->input->post('email', TRUE),
                'periode'         => $this->input->post('periode', TRUE),
                'status'          => $this->input->post('status', TRUE),
                'sk_pengangkatan' => $this->input->post('sk_pengangkatan', TRUE),
                'ruang_kantor'    => $this->input->post('ruang_kantor', TRUE),
                'updated_at'      => date('Y-m-d H:i:s')
            );

            if ($id) {
                // Update / Edit Pejabat
                $this->db->where('id', $id)->update('tb_jajaran_pejabat', $data);
                $this->session->set_flashdata('success', 'Data pejabat ' . $data['jabatan'] . ' berhasil diperbarui.');
            } else {
                // Tambah Pejabat Baru
                $data['created_at'] = date('Y-m-d H:i:s');
                $this->db->insert('tb_jajaran_pejabat', $data);
                $this->session->set_flashdata('success', 'Pejabat baru berhasil ditambahkan.');
            }
        }
        redirect('config/jajaran');
    }
}
`
  },
  {
    path: 'application/controllers/Ruangan.php',
    name: 'Ruangan.php',
    type: 'controller',
    description: 'Controller CodeIgniter 3 untuk Master Data Ruangan & Fasilitas Departemen Kimia (CRUD, Form Edit Ruangan, Filter Kategori & Status)',
    code: `<?php
defined('BASEPATH') OR exit('No direct script access allowed');

/**
 * Controller Ruangan - SIKMA Kimia FMIPA Universitas Brawijaya
 * Mengelola Master Data Ruangan, Kapasitas, Kategori (Umum, Lab, Khusus, Other), Status & Operasional
 */
class Ruangan extends CI_Controller {

    public function __construct() {
        parent::__construct();
        $this->load->library('form_validation');
        $this->load->library('session');
        $this->load->database();
        $this->load->helper(array('url', 'form'));
    }

    /**
     * Tampilkan daftar seluruh ruangan
     * Fields: Nama Ruangan, Kapasitas, Kategori, Status, Action
     */
    public function index() {
        $data['title'] = 'Master Ruangan & Fasilitas - SIKMA Kimia UB';
        $data['ruangan'] = $this->db->order_by('nama_ruangan', 'ASC')->get('tb_ruangan')->result();

        $this->load->view('layout/header', $data);
        $this->load->view('layout/sidebar', $data);
        $this->load->view('config/ruangan', $data);
        $this->load->view('layout/footer');
    }

    /**
     * Simpan data ruangan (Tambah baru atau Edit)
     * Form: Nama Ruangan, Keterangan, Kapasitas, Kategori, Status
     */
    public function simpan($id = null) {
        $this->form_validation->set_rules('nama_ruangan', 'Nama Ruangan', 'required|trim');
        $this->form_validation->set_rules('kapasitas', 'Kapasitas', 'required|numeric');
        $this->form_validation->set_rules('kategori', 'Kategori', 'required|in_list[Umum,Lab,Khusus,Other]');
        $this->form_validation->set_rules('status', 'Status', 'required|in_list[Aktif,Tidak Aktif]');

        if ($this->form_validation->run() == FALSE) {
            $this->session->set_flashdata('error', validation_errors());
        } else {
            $data = array(
                'nama_ruangan' => $this->input->post('nama_ruangan', TRUE),
                'keterangan'   => $this->input->post('keterangan', TRUE),
                'kapasitas'    => (int) $this->input->post('kapasitas', TRUE),
                'kategori'     => $this->input->post('kategori', TRUE),
                'status'       => $this->input->post('status', TRUE),
                'updated_at'   => date('Y-m-d H:i:s')
            );

            if ($id) {
                // Edit Ruangan
                $this->db->where('id', $id)->update('tb_ruangan', $data);
                $this->session->set_flashdata('success', 'Data ruangan ' . $data['nama_ruangan'] . ' berhasil diperbarui.');
            } else {
                // Tambah Ruangan Baru
                $data['id'] = 'ruang-' . time();
                $data['created_at'] = date('Y-m-d H:i:s');
                $this->db->insert('tb_ruangan', $data);
                $this->session->set_flashdata('success', 'Ruangan baru berhasil ditambahkan.');
            }
        }
        redirect('config/ruangan');
    }

    /**
     * Hapus data ruangan
     */
    public function hapus($id) {
        if ($id) {
            $this->db->where('id', $id)->delete('tb_ruangan');
            $this->session->set_flashdata('success', 'Data ruangan berhasil dihapus.');
        }
        redirect('config/ruangan');
    }
}
`
  }
];
