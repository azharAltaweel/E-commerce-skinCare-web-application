using System.ComponentModel.DataAnnotations;

namespace E_commerce_Website__Skincare_.Models
{
    public class Review
    {
        public int Id { get; set; }

        public string UserId { get; set; }

        public int ProductId { get; set; }

        [Required]
        public string Comment { get; set; }

        [Range(1, 5)]
        public int Rating { get; set; }

        public bool IsApproved { get; set; } = false;

        public DateTime CreatedAt { get; set; }
    = DateTime.Now;
        public ApplicationUser User { get; set; }
        public Product Product { get; set; }

    }
}
