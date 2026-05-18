using Microsoft.AspNetCore.Mvc;
using E_commerce_Website__Skincare_.Data;
using E_commerce_Website__Skincare_.Models;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;
using System.Linq;
using System.Security.Claims;
using System.Collections.Generic;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Authorization;
using System;

namespace E_commerce_Website__Skincare_.Controllers
{
    public class CartController : Controller
    {
        private readonly ApplicationDbContext _context;
        private readonly UserManager<ApplicationUser> _userManager;

        public CartController(ApplicationDbContext context, UserManager<ApplicationUser> userManager)
        {
            _context = context;
            _userManager = userManager;
        }

        public IActionResult Index()
        {
            return View();
        }

        [Authorize]
        public IActionResult Checkout()
        {
            return View();
        }

        [Authorize]
        public IActionResult Payment()
        {
            return View();
        }

        [HttpGet]
        public async Task<IActionResult> GetCartItems()
        {
            var cartItemsDto = new List<CartItemDto>();

            if (User.Identity != null && User.Identity.IsAuthenticated)
            {
                var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
                var dbItems = await _context.CartItems
                    .Include(c => c.Product)
                        .ThenInclude(p => p.Images)
                    .Include(c => c.Product.Category)
                    .Where(c => c.UserId == userId)
                    .ToListAsync();

                foreach (var item in dbItems)
                {
                    if (item.Product != null)
                    {
                        cartItemsDto.Add(new CartItemDto
                        {
                            Id = item.Product.Id,
                            Name = item.Product.Name,
                            Price = (double)item.Product.Price,
                            Image = item.Product.Images?.FirstOrDefault()?.ImageUrl ?? "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=400",
                            Size = "50ml",
                            Category = item.Product.Category?.Name ?? "Skincare",
                            Quantity = item.Quantity
                        });
                    }
                }
            }
            else
            {
                var sessionItems = HttpContext.Session.GetObjectFromJson<List<SessionCartItem>>("SessionCart") ?? new List<SessionCartItem>();
                if (sessionItems.Any())
                {
                    var productIds = sessionItems.Select(si => si.ProductId).ToList();
                    var products = await _context.Products
                        .Include(p => p.Images)
                        .Include(p => p.Category)
                        .Where(p => productIds.Contains(p.Id))
                        .ToListAsync();

                    foreach (var sessionItem in sessionItems)
                    {
                        var product = products.FirstOrDefault(p => p.Id == sessionItem.ProductId);
                        if (product != null)
                        {
                            cartItemsDto.Add(new CartItemDto
                            {
                                Id = product.Id,
                                Name = product.Name,
                                Price = (double)product.Price,
                                Image = product.Images?.FirstOrDefault()?.ImageUrl ?? "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=400",
                                Size = "50ml",
                                Category = product.Category?.Name ?? "Skincare",
                                Quantity = sessionItem.Quantity
                            });
                        }
                    }
                }
            }

            return Json(cartItemsDto);
        }

        [HttpPost]
        public async Task<IActionResult> AddToCart(int productId, int quantity = 1)
        {
            var product = await _context.Products.FindAsync(productId);
            if (product == null)
            {
                return Json(new { success = false, message = "Product not found." });
            }

            if (User.Identity != null && User.Identity.IsAuthenticated)
            {
                var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
                var existingItem = await _context.CartItems
                    .FirstOrDefaultAsync(c => c.UserId == userId && c.ProductId == productId);

                if (existingItem != null)
                {
                    existingItem.Quantity += quantity;
                }
                else
                {
                    var newItem = new CartItem
                    {
                        UserId = userId,
                        ProductId = productId,
                        Quantity = quantity
                    };
                    _context.CartItems.Add(newItem);
                }
                await _context.SaveChangesAsync();
            }
            else
            {
                var sessionItems = HttpContext.Session.GetObjectFromJson<List<SessionCartItem>>("SessionCart") ?? new List<SessionCartItem>();
                var existingItem = sessionItems.FirstOrDefault(si => si.ProductId == productId);

                if (existingItem != null)
                {
                    existingItem.Quantity += quantity;
                }
                else
                {
                    sessionItems.Add(new SessionCartItem
                    {
                        ProductId = productId,
                        Quantity = quantity
                    });
                }
                HttpContext.Session.SetObjectAsJson("SessionCart", sessionItems);
            }

            return Json(new { success = true });
        }

        [HttpPost]
        public async Task<IActionResult> UpdateQuantity(int productId, int change)
        {
            if (User.Identity != null && User.Identity.IsAuthenticated)
            {
                var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
                var existingItem = await _context.CartItems
                    .FirstOrDefaultAsync(c => c.UserId == userId && c.ProductId == productId);

                if (existingItem != null)
                {
                    existingItem.Quantity += change;
                    if (existingItem.Quantity <= 0)
                    {
                        _context.CartItems.Remove(existingItem);
                    }
                    await _context.SaveChangesAsync();
                }
            }
            else
            {
                var sessionItems = HttpContext.Session.GetObjectFromJson<List<SessionCartItem>>("SessionCart") ?? new List<SessionCartItem>();
                var existingItem = sessionItems.FirstOrDefault(si => si.ProductId == productId);

                if (existingItem != null)
                {
                    existingItem.Quantity += change;
                    if (existingItem.Quantity <= 0)
                    {
                        sessionItems.Remove(existingItem);
                    }
                    HttpContext.Session.SetObjectAsJson("SessionCart", sessionItems);
                }
            }

            return Json(new { success = true });
        }

        [HttpPost]
        public async Task<IActionResult> RemoveFromCart(int productId)
        {
            if (User.Identity != null && User.Identity.IsAuthenticated)
            {
                var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
                var existingItem = await _context.CartItems
                    .FirstOrDefaultAsync(c => c.UserId == userId && c.ProductId == productId);

                if (existingItem != null)
                {
                    _context.CartItems.Remove(existingItem);
                    await _context.SaveChangesAsync();
                }
            }
            else
            {
                var sessionItems = HttpContext.Session.GetObjectFromJson<List<SessionCartItem>>("SessionCart") ?? new List<SessionCartItem>();
                var existingItem = sessionItems.FirstOrDefault(si => si.ProductId == productId);

                if (existingItem != null)
                {
                    sessionItems.Remove(existingItem);
                    HttpContext.Session.SetObjectAsJson("SessionCart", sessionItems);
                }
            }

            return Json(new { success = true });
        }

        [HttpGet]
        public async Task<IActionResult> GetCartCount()
        {
            int count = 0;
            if (User.Identity != null && User.Identity.IsAuthenticated)
            {
                var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
                count = await _context.CartItems
                    .Where(c => c.UserId == userId)
                    .SumAsync(c => c.Quantity);
            }
            else
            {
                var sessionItems = HttpContext.Session.GetObjectFromJson<List<SessionCartItem>>("SessionCart");
                if (sessionItems != null)
                {
                    count = sessionItems.Sum(si => si.Quantity);
                }
            }

            return Json(new { count });
        }

        [HttpPost]
        public async Task<IActionResult> ClearCart()
        {
            if (User.Identity != null && User.Identity.IsAuthenticated)
            {
                var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
                var dbItems = await _context.CartItems.Where(c => c.UserId == userId).ToListAsync();
                _context.CartItems.RemoveRange(dbItems);
                await _context.SaveChangesAsync();
            }
            else
            {
                HttpContext.Session.Remove("SessionCart");
            }
            return Json(new { success = true });
        }

        [HttpPost]
        public IActionResult SaveCheckoutInfo([FromBody] CheckoutInfoDto info)
        {
            if (info == null)
            {
                return BadRequest("Invalid checkout information.");
            }

            HttpContext.Session.SetObjectAsJson("CheckoutInfo", info);
            return Json(new { success = true });
        }

        [HttpPost]
        public async Task<IActionResult> PlaceOrder()
        {
            // 1. Get current cart items
            var cartItems = new List<SessionCartItem>();
            string userId = null;

            if (User.Identity != null && User.Identity.IsAuthenticated)
            {
                userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
                var dbItems = await _context.CartItems
                    .Where(c => c.UserId == userId)
                    .ToListAsync();

                foreach (var dbItem in dbItems)
                {
                    cartItems.Add(new SessionCartItem
                    {
                        ProductId = dbItem.ProductId,
                        Quantity = dbItem.Quantity
                    });
                }
            }
            else
            {
                var sessionItems = HttpContext.Session.GetObjectFromJson<List<SessionCartItem>>("SessionCart");
                if (sessionItems != null)
                {
                    cartItems = sessionItems;
                }
            }

            // 2. Validate cart existence
            if (!cartItems.Any())
            {
                return Json(new { success = false, message = "Your cart is empty. Please add items to your cart before checking out." });
            }

            // 3. Validate product existence and stock
            foreach (var item in cartItems)
            {
                var product = await _context.Products.FindAsync(item.ProductId);
                if (product == null)
                {
                    return Json(new { success = false, message = $"Product with ID {item.ProductId} no longer exists." });
                }

                if (product.StockQuantity < item.Quantity)
                {
                    return Json(new { success = false, message = $"Sorry, '{product.Name}' is out of stock or does not have enough stock available. Available stock: {product.StockQuantity}." });
                }
            }

            // 4. Calculate pricing
            decimal subtotal = 0;
            foreach (var item in cartItems)
            {
                var product = await _context.Products.FindAsync(item.ProductId);
                subtotal += product.Price * item.Quantity;
            }

            decimal tax = subtotal * 0.08m; // 8% Tax
            decimal shipping = 0;

            // Retrieve Shipping Method from CheckoutInfo
            var checkoutInfo = HttpContext.Session.GetObjectFromJson<CheckoutInfoDto>("CheckoutInfo");
            if (checkoutInfo != null && checkoutInfo.ShippingMethod == "15")
            {
                shipping = 15.00m; // Express shipping
            }

            decimal total = subtotal + tax + shipping;

            // 5. Ensure valid database User ID (Foreign Key constraint helper)
            if (string.IsNullOrEmpty(userId))
            {
                var guestUser = await _userManager.FindByEmailAsync("guest@glowcare.com");
                if (guestUser == null)
                {
                    guestUser = new ApplicationUser
                    {
                        UserName = "guest@glowcare.com",
                        Email = "guest@glowcare.com",
                        FullName = "Guest Customer"
                    };
                    var createResult = await _userManager.CreateAsync(guestUser, "Guest@123");
                    if (!createResult.Succeeded)
                    {
                        return Json(new { success = false, message = "Failed to initialize guest checkout session." });
                    }
                }
                userId = guestUser.Id;
            }

            // 6. Create Order record
            var order = new Order
            {
                UserId = userId,
                OrderDate = DateTime.Now,
                TotalAmount = total,
                Status = "Processing"
            };

            _context.Orders.Add(order);
            await _context.SaveChangesAsync();

            // 7. Save OrderItems and update stock
            foreach (var item in cartItems)
            {
                var product = await _context.Products.FindAsync(item.ProductId);
                product.StockQuantity -= item.Quantity; // Deduct Stock

                var orderItem = new OrderItem
                {
                    OrderId = order.Id,
                    ProductId = item.ProductId,
                    Quantity = item.Quantity,
                    Price = product.Price
                };

                _context.OrderItems.Add(orderItem);
            }
            await _context.SaveChangesAsync();

            // 8. Integrate Simulated Payment Gateway (Stripe simulation)
            string transactionId = "ch_stripe_" + Guid.NewGuid().ToString().Replace("-", "").Substring(0, 16);
            bool isPaymentSuccessful = true; // In a simulation, we default to success

            var payment = new Payment
            {
                OrderId = order.Id,
                PaymentMethod = "Stripe / Card",
                TransactionId = transactionId,
                IsPaid = isPaymentSuccessful
            };

            _context.Payments.Add(payment);

            if (isPaymentSuccessful)
            {
                order.Status = "Completed";
            }
            else
            {
                order.Status = "Cancelled";
            }

            await _context.SaveChangesAsync();

            // 9. Clear the cart
            if (User.Identity != null && User.Identity.IsAuthenticated)
            {
                var dbItems = await _context.CartItems.Where(c => c.UserId == userId).ToListAsync();
                _context.CartItems.RemoveRange(dbItems);
            }
            else
            {
                HttpContext.Session.Remove("SessionCart");
            }
            HttpContext.Session.Remove("CheckoutInfo");
            await _context.SaveChangesAsync();

            return Json(new { success = true, orderId = order.Id, transactionId = transactionId });
        }

        // Retain for legacy frontend compatibility (but returns empty list to obey "no default products" rule)
        [HttpGet]
        public IActionResult GetDefaultCartItems()
        {
            return Json(new List<object>());
        }
    }

    public class CartItemDto
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public double Price { get; set; }
        public string Image { get; set; }
        public string Size { get; set; }
        public string Category { get; set; }
        public int Quantity { get; set; }
    }

    public class CheckoutInfoDto
    {
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string Address { get; set; }
        public string City { get; set; }
        public string PostalCode { get; set; }
        public string Phone { get; set; }
        public string ShippingMethod { get; set; }
    }
}