using E_commerce_Website__Skincare_.Data;
using E_commerce_Website__Skincare_.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace E_commerce_Website__Skincare_.Controllers
{
    //[Authorize(Roles = "Admin")]

    public class AdminController : Controller
    {
        private readonly UserManager<ApplicationUser> _userManager;

        private readonly ApplicationDbContext _context;

        public AdminController(
            UserManager<ApplicationUser> userManager,
            ApplicationDbContext context)
        {
            _userManager = userManager;

            _context = context;
        }

        // USERS PAGE
        public async Task<IActionResult> UsersInfo()
        {
            var users = await _userManager.Users.ToListAsync();

            return View(users);
        }

        // PRODUCTS PAGE
        public async Task<IActionResult> ProductsInfo()
        {
            var products = await _context.Products
                .Include(p => p.Category)
                .Include(p => p.Images)
                .ToListAsync();

            ViewBag.Categories = await _context.Categories.ToListAsync();

            return View(products);
        }

        // Action to  fetch info orders from db to show in view 
        public async Task<IActionResult> OrdersInfo()
        {
            var orders = await _context.Orders
                .Include(o => o.User)
                .Include(o => o.OrderItems)
                    .ThenInclude(oi => oi.Product)
                .OrderByDescending(o => o.OrderDate)
                .ToListAsync();
            return View(orders);
        }

        // Update statsus order (Processing / Completed / Cancelled)
        [HttpPost]
        public async Task<IActionResult> UpdateOrderStatus(int orderId, string status)
        {
            var order = await _context.Orders.FindAsync(orderId);
            if (order == null) return NotFound();

            order.Status = status;
            await _context.SaveChangesAsync();

            return Json(new { success = true, message = "Done Update Status Order Succesed" });
        }

        // Delete Orderer
        [HttpPost]
        public async Task<IActionResult> DeleteOrder(int orderId)
        {
            var order = await _context.Orders
                .Include(o => o.OrderItems)
                .FirstOrDefaultAsync(o => o.Id == orderId);
            if (order == null) return NotFound();

            _context.OrderItems.RemoveRange(order.OrderItems);
            _context.Orders.Remove(order);
            await _context.SaveChangesAsync();

            return Json(new { success = true, message = "Done Delete Order Succesed" });
        }

        // Order Details 
        public async Task<IActionResult> OrderDetails(int id)
        {
            var order = await _context.Orders
                .Include(o => o.User)
                .Include(o => o.OrderItems)
                    .ThenInclude(oi => oi.Product)
                .FirstOrDefaultAsync(o => o.Id == id);
            if (order == null) return NotFound();
            return PartialView("_OrderDetails", order);
        }

        // Creat Recumendation => Testimonials
        public async Task<IActionResult> Testimonials()
        {
            var testimonials = await _context.Testimonials
                .Include(t => t.User)
                .OrderByDescending(t => t.Id)
                .ToListAsync();

            var reviews = await _context.Reviews
                .Include(t => t.User)
                .Include(t => t.Product)
                .OrderByDescending(t => t.Id)
                .ToListAsync();

            ViewBag.Reviews = reviews;
            return View(testimonials);
        }

        // Accept recumendation 
        [HttpPost]
        public async Task<IActionResult> ApproveTestimonial(int id)
        {
            var testimonials = await _context.Testimonials.FindAsync(id);
            if (testimonials == null) return NotFound();

            testimonials.IsApproved = !testimonials.IsApproved;
            await _context.SaveChangesAsync();
            return Json(new { success = true, approved = testimonials.IsApproved });
        }

        // deleet recumendation
        [HttpPost]
        public async Task<IActionResult> DeleteTestimonial(int id)
        {
            var testimonials = await _context.Testimonials.FindAsync(id);
            if (testimonials == null) return NotFound();

            _context.Testimonials.Remove(testimonials);
            await _context.SaveChangesAsync();
            return Json(new { success = true });
        }

        // Approve reviwe
        [HttpPost]
        public async Task<IActionResult> ApproveReview(int id)
        {
            var review = await _context.Reviews.FindAsync(id);
            if (review == null) return NotFound();

            review.IsApproved = !review.IsApproved;
            await _context.SaveChangesAsync();

            return Json(new { success = true, approved = review.IsApproved });
        }

        // Delete review
        [HttpPost]
        public async Task<IActionResult> DeleteReview(int id)
        {
            var review = await _context.Reviews.FindAsync(id);
            if (review == null) return NotFound();

            _context.Reviews.Remove(review);
            await _context.SaveChangesAsync();

            return Json(new { success = true });
        }

        //(POPUP) PROFILE
        public async Task<IActionResult> Profile()
        {
            var user = await _userManager.GetUserAsync(User);
            if (user == null) return NotFound();

            return PartialView("_Profile", user);
        }

        // eedit info profile 
        [HttpPost]
        public async Task<IActionResult> UpdateProfile(string fullName, string email, string? newPassword)
        {
            var user = await _userManager.GetUserAsync(User);
            if (user == null) return NotFound();

            user.FullName = fullName;
            user.Email = email;
            user.UserName = email;

            await _userManager.UpdateAsync(user);

            if (!string.IsNullOrEmpty(newPassword))
            {
                var token = await _userManager.GeneratePasswordResetTokenAsync(user);
                await _userManager.ResetPasswordAsync(user, token, newPassword);
            }

            return Json(new { success = true, messsage = "Profile updated successfully" });
        }
    }
}