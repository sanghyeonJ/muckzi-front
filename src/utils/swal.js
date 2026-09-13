import Swal from "sweetalert2";

const MuckziSwal = Swal.mixin({
  confirmButtonText: "확인",
  confirmButtonColor: "#111827",
  customClass: {
    popup: "rounded-2xl",
    confirmButton: "rounded-lg px-5 py-2.5",
  },
});

export default MuckziSwal;