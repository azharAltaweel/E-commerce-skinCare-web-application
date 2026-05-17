using E_commerce_Website__Skincare_.Data;
using E_commerce_Website__Skincare_.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace E_commerce_Website__Skincare_.Controllers
{
    public class UserController : Controller
    {
        private readonly ApplicationDbContext _context;
        private readonly UserManager<ApplicationUser> _userManager;

        public UserController(ApplicationDbContext context, UserManager<ApplicationUser> userManager)
        public UserController(ApplicationDbContext context, UserManager<ApplicationUser> userManager)
        {
            _context = context;
            _userManager = userManager;
        }
        public IActionResult Products(string search, int? categoryId, string sortOrder)
        public async Task<IActionResult> HomePage()

            var products = _context.Products
                .Include(p => p.Images)
                .Include(p => p.Category)
                .AsQueryable();//هاي عشان نعمل sorting and filtering قبل ما تكون ليست
                               // SEARCH
            //  Existing Products Fetch
            var products = await _context.Products
                    .Include(p => p.Images).Include(p => p.Category).Take(4)
                    .ToListAsync();
            //  Existing Categories Fetch
            ViewBag.Categories = await _context.Categories.ToListAsync();
        public async Task<IActionResult> HomePage()
            // SEARCH
            if (!string.IsNullOrEmpty(search))
            {
                search = search.Trim();
            //  Fetch active discounts, including their associated products and product images
            ViewBag.DiscountProducts = await _context.Discounts
                .Include(d => d.Products)
                    .ThenInclude(p => p.Images)
                .Take(4)
                .ToListAsync();
        public IActionResult Products(string search, int? categoryId, string sortOrder)
                products = products.Where(p =>
            //  Fetch dynamic approved testimonials
            ViewBag.Testimonials = await _context.Testimonials
                .Include(t => t.User) // Include User table to grab their name
                .Where(t => t.IsApproved) // Only show testimonials that are checked true
                .Take(3) // Limit layout to 3 cards
                .ToListAsync();
        {
                    p.Name.Contains(search)

                    ||

                    p.Category.Name.Contains(search)
                );
            return View(products);



            // FILTER

            if (categoryId.HasValue)
        [HttpPost]
        [ValidateAntiForgeryToken]
        public IActionResult AddToCart(int productId, int quantity = 1)
        }
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
            // Implementation logic for your shopping cart (Session, Cookie, or DB)
            // Example: _cartService.AddItem(productId, quantity);
        // Action to handle the Add to Cart submission
            ViewData["RelatedProducts"] =
            relatedProducts;
            TempData["SuccessMessage"] = "Item added to cart successfully!";

            return View(product);
            // Redirect back to the page the user was on
            return RedirectToAction(nameof(Index));
        {


        }

        public IActionResult AddReview(
     int productId,
     string comment,
     int rating)
        {
            // User must login
            if (!User.Identity.IsAuthenticated)
        [Authorize] // Guards the endpoint from unauthenticated requests
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> SubmitTestimonial(string content)

                return RedirectToAction(
                    "Login",
                    "Account");
            }

            // Validate rating
            if (rating < 1 || rating > 5)
            if (string.IsNullOrWhiteSpace(content))

                TempData["Error"] =
                    "Please select a rating.";

                return RedirectToAction(
                    "ProductDetails",
                    new { id = productId });
                TempData["Error"] = "Testimonial content cannot be empty.";
                return RedirectToAction("HomePage");
        [HttpPost]
        {
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
            // Grab the logged-in user's unique Identification ID
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            {
            if (alreadyReviewed)
            if (userId == null)
            }
                TempData["Error"] =
                    "You already reviewed this product.";

                return RedirectToAction(
                    "ProductDetails",
                    new { id = productId });
                return Challenge(); // Forces a re-login sequence if identity check hiccups


            // Create review
            var review = new Review
            // Build the new testimonial block awaiting manual admin approval
            var testimonial = new Testimonial
            {
            }

            {

                Comment = comment,

                Rating = rating,

                // Temporarily true for testing
                IsApproved = true,

                CreatedAt = DateTime.Now
                Content = content.Trim(),
                IsApproved = false // 👈 Keeps it invisible on the homepage until you flip this to true!
                ProductId = productId,

            // Save to DB
            _context.Reviews.Add(review);

            _context.SaveChanges();
            _context.Testimonials.Add(testimonial);
            await _context.SaveChangesAsync();
                UserId = userId,
            TempData["Success"] =
                "Review submitted successfully.";
            // Optional: Add a success notification system message
            TempData["Success"] = "Thank you! Your feedback has been sent to our administrator for approval.";
            };
            return RedirectToAction("HomePage");
            return RedirectToAction(
                "ProductDetails",
                new { id = productId });


        public async Task<IActionResult> Categories()




        public IActionResult Wishlist()

            // Fetch categories from database
            var categories = await _context.Categories.ToListAsync();
            return View(categories);
            return View();
        }

        {
        }






























    } 
} 