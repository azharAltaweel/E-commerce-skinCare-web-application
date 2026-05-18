using Microsoft.AspNetCore.Mvc.ModelBinding.Validation;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.AspNetCore.Mvc.ModelBinding.Validation;

namespace E_commerce_Website__Skincare_.Models
{
    public class Product
    {
        public int Id { get; set; }
        [Required]
            [StringLength(150)]
        public string Name { get; set; }
        [Required]
        public string Description { get; set; }
        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal Price { get; set; }

        [Range(0, int.MaxValue)]
        public int StockQuantity { get; set; }
        [Required]
        public int CategoryId { get; set; }
        [ValidateNever] public Category Category { get; set; }

        public int? DiscountId { get; set; }

        [ValidateNever] public Discount? Discount { get; set; }
        [ValidateNever] public virtual ICollection<ProductImage> Images { get; set; }
        [ValidateNever] public virtual ICollection<Review> Reviews { get; set; }

    }
}
