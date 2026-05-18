using E_commerce_Website__Skincare_.Data;
using E_commerce_Website__Skincare_.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.IO;

namespace E_commerce_Website__Skincare_.Controllers
{
    //[Authorize(Roles = "Admin")]

    public class AdminController : Controller
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly IWebHostEnvironment _webHostEnvironment;
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
                 .Include(p => p.Discount)
                .ToListAsync();

            ViewBag.Categories = await _context.Categories.ToListAsync();
            ViewBag.Discounts = await _context.Discounts.ToListAsync();
            return View(products);
        }

        // ADD PRODUCT

        [HttpPost]
        public async Task<IActionResult> AddProduct(
            Product product,
            List<IFormFile> images)
        {
            if (ModelState.IsValid)
            {
                _context.Products.Add(product);

                await _context.SaveChangesAsync();

                // save images
                if (images != null && images.Any())
                {
                    foreach (var image in images)
                    {
                        string fileName =
                            Guid.NewGuid() +
                            Path.GetExtension(image.FileName);

                        string folder =
                            Path.Combine(
                            Directory.GetCurrentDirectory(),
                            "wwwroot/uploads");

                        Directory.CreateDirectory(folder);

                        string filePath =
                            Path.Combine(folder, fileName);

                        using var stream =
                            new FileStream(filePath,
                            FileMode.Create);

                        await image.CopyToAsync(stream);

                        _context.ProductImages.Add(
                            new ProductImage
                            {
                                ProductId = product.Id,
                                ImageUrl =
                                "/uploads/" + fileName
                            });
                    }
                }

                await _context.SaveChangesAsync();

                return RedirectToAction(
                    "ProductsInfo");
            }

            ViewBag.Categories =
                _context.Categories.ToList();

            ViewBag.Discounts =
                _context.Discounts.ToList();

            return View();
        }
        public async Task<IActionResult> ProductDetails(int id)
        {
            var product = await _context.Products
                .Include(p => p.Images)
                .Include(p => p.Category)
                .Include(p => p.Discount)
                .Include(p => p.Reviews)
                    .ThenInclude(r => r.User)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (product == null)
            {
                return NotFound();
            }

            return View(product);
        }
        [HttpPost]
        public async Task<IActionResult> DeleteProduct(int id)
        {
            var product = await _context.Products
                .Include(p => p.Images)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (product == null)
            {
                return Json(new
                {
                    success = false,
                    message = "Product not found"
                });
            }

            try
            {
                // DELETE IMAGES FROM FOLDER
                if (product.Images != null && product.Images.Any())
                {
                    foreach (var image in product.Images)
                    {
                        if (string.IsNullOrEmpty(image.ImageUrl))
                            continue;

                        var filePath = Path.Combine(
                            Directory.GetCurrentDirectory(),
                            "wwwroot",
                            image.ImageUrl.TrimStart('/', '\\'));

                        if (System.IO.File.Exists(filePath))
                        {
                            System.IO.File.Delete(filePath);
                        }
                    }

                    // DELETE IMAGES FROM DATABASE
                    _context.ProductImages.RemoveRange(product.Images);
                }

                // DELETE PRODUCT
                _context.Products.Remove(product);

                await _context.SaveChangesAsync();

                return Json(new
                {
                    success = true,
                    message = "Product deleted successfully"
                });
            }
            catch (Exception ex)
            {
                return Json(new
                {
                    success = false,
                    message = "Something went wrong while deleting product.",
                    error = ex.Message // remove in production if needed
                });
            }
        }
        [HttpPost]
        public async Task<IActionResult> EditProduct(
            Product updatedProduct,
            List<IFormFile> images)
        {
            var product = await _context.Products
                .Include(p => p.Images)
                .FirstOrDefaultAsync(
                    p => p.Id == updatedProduct.Id);

            if (product == null)
                return NotFound();

            product.Name =
                updatedProduct.Name;

            product.Description =
                updatedProduct.Description;

            product.Price =
                updatedProduct.Price;

            product.StockQuantity =
                updatedProduct.StockQuantity;

            product.CategoryId =
                updatedProduct.CategoryId;

            // مهم جداً
            product.DiscountId =
                updatedProduct.DiscountId;

            await _context.SaveChangesAsync();

            return RedirectToAction(
                "ProductsInfo");
        }




        [HttpPost]
        public async Task<IActionResult> DeleteProductImage(int imageId)
        {
            var image = await _context.ProductImages
                .FirstOrDefaultAsync(i => i.Id == imageId);

            if (image == null)
            {
                return Json(new
                {
                    success = false,
                    message = "Image not found"
                });
            }

            // DELETE IMAGE FROM WWWROOT

            var filePath = Path.Combine(
                Directory.GetCurrentDirectory(),
                "wwwroot",
                image.ImageUrl.TrimStart('/'));

            if (System.IO.File.Exists(filePath))
            {
                System.IO.File.Delete(filePath);
            }

            // DELETE FROM DATABASE

            _context.ProductImages.Remove(image);

            await _context.SaveChangesAsync();

            return Json(new
            {
                success = true,
                message = "Image deleted successfully"
            });
        }



        [HttpPost]
        public async Task<IActionResult> AddMoreImages(
    int productId,
    List<IFormFile> images)
        {
            var product = await _context.Products
                .FirstOrDefaultAsync(p => p.Id == productId);

            if (product == null)
            {
                return NotFound();
            }

            if (images != null && images.Count > 0)
            {
                foreach (var image in images)
                {
                    // UNIQUE NAME

                    var fileName = Guid.NewGuid().ToString()
                                   + Path.GetExtension(image.FileName);

                    // PATH

                    var path = Path.Combine(
                        Directory.GetCurrentDirectory(),
                        "wwwroot/images/products",
                        fileName);

                    // SAVE IMAGE

                    using (var stream = new FileStream(path, FileMode.Create))
                    {
                        await image.CopyToAsync(stream);
                    }

                    // SAVE TO DATABASE

                    ProductImage productImage = new ProductImage
                    {
                        ImageUrl = "/images/products/" + fileName,
                        ProductId = productId
                    };

                    _context.ProductImages.Add(productImage);
                }

                await _context.SaveChangesAsync();
            }

            return RedirectToAction("ProductDetails", new { id = productId });
        }










            TempData["Success"] = "Product has been updated successfully!";
            return RedirectToAction("ProductsInfo");
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


        // GET: /Admin/Categories
        public async Task<IActionResult> Categories()
        {
            var categories = await _context.Categories
                                   .Include(c => c.Products)
                                   .ToListAsync();
            return View(categories);
        }

        // POST: /Admin/AddCategory
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> AddCategory(Category category, IFormFile categoryImageFile)
        {
            if (categoryImageFile != null && categoryImageFile.Length > 0)
            {
                var fileName = Guid.NewGuid().ToString() + Path.GetExtension(categoryImageFile.FileName);

                var uploadDir = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "images", "categories");

                if (!Directory.Exists(uploadDir))
                {
                    Directory.CreateDirectory(uploadDir);
                }

                var fullPath = Path.Combine(uploadDir, fileName);

                using (var stream = new FileStream(fullPath, FileMode.Create))
                {
                    await categoryImageFile.CopyToAsync(stream);
                }

                category.ImageUrl = "/images/categories/" + fileName;
            }
            else
            {
                category.ImageUrl = "/images/categories/default-placeholder.png";
            }

            _context.Categories.Add(category);
            await _context.SaveChangesAsync();

            TempData["Success"] = "Category '" + category.Name + "' has been added successfully!";
            return RedirectToAction("Categories");
        }

        // POST: /Admin/EditCategory
        [HttpPost]
        // POST: /Admin/EditCategory
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> EditCategory(Category category, IFormFile? categoryImageFile)
        {
            var existingCategory = await _context.Categories.FindAsync(category.Id);

            if (existingCategory == null)
            {
                TempData["Error"] = "Category not found.";
                return NotFound();
            }

            existingCategory.Name = category.Name;

            if (categoryImageFile != null && categoryImageFile.Length > 0)
            {
                if (!string.IsNullOrEmpty(existingCategory.ImageUrl) &&
                    !existingCategory.ImageUrl.Contains("default-placeholder.png"))
                {
                    var oldFullPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", existingCategory.ImageUrl.TrimStart('/'));

                    if (System.IO.File.Exists(oldFullPath))
                    {
                        System.IO.File.Delete(oldFullPath);
                    }
                }

                var fileName = Guid.NewGuid().ToString() + Path.GetExtension(categoryImageFile.FileName);
                var uploadDir = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "images", "categories");

                if (!Directory.Exists(uploadDir))
                {
                    Directory.CreateDirectory(uploadDir);
                }

                var newFullPath = Path.Combine(uploadDir, fileName);

                using (var stream = new FileStream(newFullPath, FileMode.Create))
                {
                    await categoryImageFile.CopyToAsync(stream);
                }

                existingCategory.ImageUrl = "/images/categories/" + fileName;
            }
            
            await _context.SaveChangesAsync();

            TempData["Success"] = "Category '" + category.Name + "' has been updated successfully!";
            return RedirectToAction("Categories");
        }
        // POST: /Admin/DeleteCategory
        [HttpPost]
        public async Task<IActionResult> DeleteCategory(int id)
        {
            var category = await _context.Categories
                .Include(c => c.Products) // Load the related products
                .FirstOrDefaultAsync(c => c.Id == id);

            if (category == null)
            {
                return Json(new { success = false, message = "Error: Category not found" });
            }

            // Check if category is empty before allowing delete
            if (category.Products != null && category.Products.Any())
            {
                return Json(new { success = false, message = "Cannot delete: This category contains products." });
            }

            _context.Categories.Remove(category);
            await _context.SaveChangesAsync();

            return Json(new { success = true, message = "Category deleted successfully" });
        }

        //Get: /Dashboard 
        public async Task<IActionResult> Dashboard()
        {
            // Basic Stats
            ViewBag.TotalProducts = await _context.Products.CountAsync();
            ViewBag.TotalCategories = await _context.Categories.CountAsync();
            ViewBag.TotalOrders = await _context.Orders.CountAsync();
            ViewBag.TotalUsers = await _context.Users.CountAsync();

            var last7Days = Enumerable.Range(0, 7)
                .Select(i => DateTime.Today.AddDays(-i))
                .OrderBy(d => d).ToList();

            // Weekly Orders anonymous list
            var orders = await _context.Orders
                .Where(o => o.OrderDate >= DateTime.Today.AddDays(-6))
                .ToListAsync();

            ViewBag.WeeklyOrders = last7Days.Select(day => new {
                DayLabel = day.ToString("ddd").Substring(0, 1),
                Count = orders.Count(o => o.OrderDate.Date == day.Date)
            }).ToList();

            //// Weekly Users anonymous list
            //var users = await _context.Users
            //    .Where(u => u.CreatedAt >= DateTime.Today.AddDays(-6))
            //    .ToListAsync();

            //ViewBag.WeeklyNewUsers = last7Days.Select(day => new {
            //    DayLabel = day.ToString("ddd").Substring(0, 1),
            //    Count = users.Count(u => u.CreatedAt.Date == day.Date)
            //}).ToList();

            return View();
        }
    }
}