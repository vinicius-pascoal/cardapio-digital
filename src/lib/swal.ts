// Helper wrappers for SweetAlert2
// Requires 'sweetalert2' to be installed
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

export function swalSuccess(title: string, text?: string) {
  return MySwal.fire({ icon: 'success', title, text, confirmButtonColor: '#16a34a' });
}

export function swalError(title: string, text?: string) {
  return MySwal.fire({ icon: 'error', title, text, confirmButtonColor: '#dc2626' });
}

export function swalInfo(title: string, text?: string) {
  return MySwal.fire({ icon: 'info', title, text, confirmButtonColor: '#2563eb' });
}

export function swalConfirm(title: string, text?: string) {
  return MySwal.fire({
    title,
    text,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#dc2626',
    cancelButtonColor: '#6b7280',
    confirmButtonText: 'Sim',
    cancelButtonText: 'Cancelar',
  });
}
