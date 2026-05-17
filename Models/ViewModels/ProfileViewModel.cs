using System.ComponentModel.DataAnnotations;

namespace E_commerce_Website__Skincare_.Models.ViewModels
{
    public class ProfileViewModel
    {
        [Required]
        [Display(Name = "Full Name")]
        public string FullName { get; set; }

        [Required]
        [EmailAddress]
        public string Email { get; set; }

        [Phone]
        [Display(Name = "Phone Number")]
        public string? PhoneNumber { get; set; }

        // Optional fields for display
        public string? MemberSince { get; set; }
        
        // Orders can be passed separately or here
        public List<OrderViewModel>? OrderHistory { get; set; }
    }

    public class OrderViewModel
    {
        public string Id { get; set; }
        public DateTime Date { get; set; }
        public string Status { get; set; }
        public decimal Total { get; set; }
    }
}
