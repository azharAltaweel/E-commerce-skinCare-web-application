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
        {
            _context = context;
            _userManager = userManager;
        }

        public async Task<IActionResult> HomePage()
        {
            //  Existing Products Fetch
            var products = await _context.Products
                    .Include(p => p.Images).Include(p => p.Category).Take(4)
                    .ToListAsync();
            //  Existing Categories Fetch
            ViewBag.Categories = await _context.Categories.ToListAsync();

            //  Fetch active discounts, including their associated products and product images
            ViewBag.DiscountProducts = await _context.Discounts
                .Include(d => d.Products)
                    .ThenInclude(p => p.Images)
                .Take(4)
                .ToListAsync();

            //  Fetch dynamic approved testimonials
            ViewBag.Testimonials = await _context.Testimonials
                .Include(t => t.User) // Include User table to grab their name
                .Where(t => t.IsApproved) // Only show testimonials that are checked true
                .Take(3) // Limit layout to 3 cards
                .ToListAsync();

            return View(products);
        }
        // Action to handle the Add to Cart submission

        [HttpPost]
        [ValidateAntiForgeryToken]
        public IActionResult AddToCart(int productId, int quantity = 1)
        {
            // Implementation logic for your shopping cart (Session, Cookie, or DB)
            // Example: _cartService.AddItem(productId, quantity);

            TempData["SuccessMessage"] = "Item added to cart successfully!";

            // Redirect back to the page the user was on
            return RedirectToAction("HomePage");
        }


        [HttpPost]
        [Authorize] // Guards the endpoint from unauthenticated requests
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> SubmitTestimonial(string content)
        {
            if (string.IsNullOrWhiteSpace(content))
            {
                TempData["Error"] = "Testimonial content cannot be empty.";
                return RedirectToAction("HomePage");
            }

            // Grab the logged-in user's unique Identification ID
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (userId == null)
            {
                return Challenge(); // Forces a re-login sequence if identity check hiccups
            }

            // Build the new testimonial block awaiting manual admin approval
            var testimonial = new Testimonial
            {
                UserId = userId,
                Content = content.Trim(),
                IsApproved = false // 👈 Keeps it invisible on the homepage until you flip this to true!
            };

            _context.Testimonials.Add(testimonial);
            await _context.SaveChangesAsync();

            // Optional: Add a success notification system message
            TempData["Success"] = "Thank you! Your feedback has been sent to our administrator for approval.";

            return RedirectToAction("HomePage");
        }

        public async Task<IActionResult> Categories()
        {
            // Fetch categories from database
            var categories = await _context.Categories.ToListAsync();
            return View(categories);
        }
    } 
} 