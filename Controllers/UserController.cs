using E_commerce_Website__Skincare_.Data;
using E_commerce_Website__Skincare_.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace E_commerce_Website__Skincare_.Controllers
{
    public class UserController : Controller
    {
        private readonly ApplicationDbContext _context;

        public UserController(ApplicationDbContext context)
        {
            _context = context;
        }

        public IActionResult Products(string search, int? categoryId, string sortOrder)
        {
            var products = _context.Products
                .Include(p => p.Images)
                .Include(p => p.Category)
                .AsQueryable();//هاي عشان نعمل sorting and filtering قبل ما تكون ليست
            // SEARCH

            if (!string.IsNullOrEmpty(search))
            {
                products = products
                    .Where(p => p.Name.Contains(search));
            }

            // FILTER

            if (categoryId.HasValue)
            {
                products = products
                    .Where(p => p.CategoryId == categoryId);
            }

            // SORT

            switch (sortOrder)
            {
                case "name":
                    products = products.OrderBy(p => p.Name);
                    break;

                case "price":
                    products = products.OrderBy(p => p.Price);
                    break;

                case "newest":
                    products = products.OrderByDescending(p => p.Id);
                    break;

                default:
                    products = products.OrderByDescending(p => p.Id);
                    break;
            }

            ViewBag.Categories = _context.Categories.ToList();
            ViewBag.SelectedCategory = categoryId;

            return View(products.ToList());
        }



        // PRODUCT DETAILS PAGE
        public IActionResult ProductDetails(int id)
        {
            var product = _context.Products

                .Include(p => p.Images)

                .Include(p => p.Category)

                .Include(p => p.Discount)

                .Include(p => p.Reviews
                    .Where(r => r.IsApproved))

                .ThenInclude(r => r.User)

                .FirstOrDefault(p => p.Id == id);

            if (product == null)
                return NotFound();


            // Average Rating
            ViewBag.AverageRating =
                product.Reviews.Any()
                ? product.Reviews
                    .Average(r => r.Rating)
                : 0;


            // Total Reviews
            ViewBag.TotalReviews =
                product.Reviews.Count();


            // Related Products
            var relatedProducts =
                _context.Products

                .Include(p => p.Images)

                .Include(p => p.Discount)

                .Where(p =>
                    p.CategoryId ==
                    product.CategoryId
                    && p.Id != id)

                .Take(4)

                .ToList();

            ViewData["RelatedProducts"] =
            relatedProducts;

            return View(product);
        }



        [HttpPost]
        public IActionResult AddReview(
     int productId,
     string comment,
     int rating)
        {
            // User must login
            if (!User.Identity.IsAuthenticated)
            {
                return RedirectToAction(
                    "Login",
                    "Account");
            }

            // Validate rating
            if (rating < 1 || rating > 5)
            {
                TempData["Error"] =
                    "Please select a rating.";

                return RedirectToAction(
                    "ProductDetails",
                    new { id = productId });
            }

            // Get current user id
            var userId =
                User.FindFirst(
                System.Security.Claims
                .ClaimTypes.NameIdentifier)
                ?.Value;

            // Check if user already reviewed
            var alreadyReviewed =
                _context.Reviews.Any(r =>
                    r.ProductId == productId
                    && r.UserId == userId);

            if (alreadyReviewed)
            {
                TempData["Error"] =
                    "You already reviewed this product.";

                return RedirectToAction(
                    "ProductDetails",
                    new { id = productId });
            }

            // Create review
            var review = new Review
            {
                ProductId = productId,

                UserId = userId,

                Comment = comment,

                Rating = rating,

                // Temporarily true for testing
                IsApproved = true,

                CreatedAt = DateTime.Now
            };

            // Save to DB
            _context.Reviews.Add(review);

            _context.SaveChanges();

            TempData["Success"] =
                "Review submitted successfully.";

            return RedirectToAction(
                "ProductDetails",
                new { id = productId });
        }





        public IActionResult Wishlist()
        {
            return View();
        }






























    }
}
