using E_commerce_Website__Skincare_.Models;
using E_commerce_Website__Skincare_.Models.ViewModels;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using E_commerce_Website__Skincare_.Data;
using Microsoft.EntityFrameworkCore;

namespace E_commerce_Website__Skincare_.Controllers
{
    public class AccountController : Controller
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly SignInManager<ApplicationUser> _signInManager;
        private readonly RoleManager<IdentityRole> _roleManager;
        private readonly ApplicationDbContext _context;

        public AccountController(UserManager<ApplicationUser> userManager, 
                                 SignInManager<ApplicationUser> signInManager,
                                 RoleManager<IdentityRole> roleManager,
                                 ApplicationDbContext context)
        {
            _userManager = userManager;
            _signInManager = signInManager;
            _roleManager = roleManager;
            _context = context;
        }

        [HttpGet]
        public IActionResult Login(string returnUrl = null)
        {
            if (User.Identity.IsAuthenticated)
            {
                if (User.IsInRole("Admin"))
                {
                    return RedirectToAction("Dashboard", "Admin");
                }
                if (!string.IsNullOrEmpty(returnUrl) && Url.IsLocalUrl(returnUrl))
                {
                    return Redirect(returnUrl);
                }
                return RedirectToAction("HomePage", "User");
            }
            ViewData["ReturnUrl"] = returnUrl;
            return View(new LoginViewModel());
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Login(LoginViewModel loginVM, string returnUrl = null)
        {
            ViewData["ReturnUrl"] = returnUrl;
            if (!ModelState.IsValid) return View(loginVM);

            var user = await _userManager.FindByEmailAsync(loginVM.Email);
            if (user != null)
            {
                var passwordCheck = await _userManager.CheckPasswordAsync(user, loginVM.Password);
                if (passwordCheck)
                {
                    var result = await _signInManager.PasswordSignInAsync(user, loginVM.Password, loginVM.RememberMe, false);
                    if (result.Succeeded)
                    {
                        // Merge guest session cart to database cart
                        await MergeSessionCartToDbAsync(user.Id);

                        var isAdmin = await _userManager.IsInRoleAsync(user, "Admin");
                        if (isAdmin)
                        {
                            TempData["Success"] = "Welcome back, Administrator!";
                            return RedirectToAction("Dashboard", "Admin");
                        }
                        TempData["Success"] = "Welcome back, " + (user.FullName ?? user.UserName.Split('@')[0]) + "!";
                        
                        if (!string.IsNullOrEmpty(returnUrl) && Url.IsLocalUrl(returnUrl))
                        {
                            return Redirect(returnUrl);
                        }
                        return RedirectToAction("HomePage", "User");
                    }
                }
                ModelState.AddModelError("", "Invalid login attempt. Please check your credentials.");
                TempData["Error"] = "Invalid login attempt. Please check your credentials.";
                return View(loginVM);
            }

            ModelState.AddModelError("", "Invalid login attempt. Please check your credentials.");
            TempData["Error"] = "Invalid login attempt. Please check your credentials.";
            return View(loginVM);
        }

        [HttpGet]
        public IActionResult Register(string returnUrl = null)
        {
            if (User.Identity.IsAuthenticated)
            {
                if (!string.IsNullOrEmpty(returnUrl) && Url.IsLocalUrl(returnUrl))
                {
                    return Redirect(returnUrl);
                }
                return RedirectToAction("HomePage", "User");
            }
            ViewData["ReturnUrl"] = returnUrl;
            return View(new RegisterViewModel());
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Register(RegisterViewModel registerVM, string returnUrl = null)
        {
            ViewData["ReturnUrl"] = returnUrl;
            if (!ModelState.IsValid) return View(registerVM);

            var user = await _userManager.FindByEmailAsync(registerVM.Email);
            if (user != null)
            {
                ModelState.AddModelError("", "This email address is already in use");
                TempData["Error"] = "This email address is already in use.";
                return View(registerVM);
            }

            var newUser = new ApplicationUser()
            {
                FullName = registerVM.FullName,
                Email = registerVM.Email,
                UserName = registerVM.Email,
                PhoneNumber = registerVM.PhoneNumber
            };

            var newUserResponse = await _userManager.CreateAsync(newUser, registerVM.Password);

            if (newUserResponse.Succeeded)
            {
                await _userManager.AddToRoleAsync(newUser, "User");
                await _signInManager.SignInAsync(newUser, isPersistent: false);

                // Merge guest session cart to database cart
                await MergeSessionCartToDbAsync(newUser.Id);

                TempData["Success"] = "Account created successfully! Welcome to GlowCare.";
                
                if (!string.IsNullOrEmpty(returnUrl) && Url.IsLocalUrl(returnUrl))
                {
                    return Redirect(returnUrl);
                }
                return RedirectToAction("HomePage", "User");
            }
            else
            {
                foreach (var error in newUserResponse.Errors)
                {
                    ModelState.AddModelError("", error.Description);
                }
                TempData["Error"] = "Registration failed. Please check the requirements.";
                return View(registerVM);
            }
        }

        [HttpGet]
        [Microsoft.AspNetCore.Authorization.Authorize]
        public async Task<IActionResult> Profile()
        {
            var user = await _userManager.GetUserAsync(User);
            if (user == null)
            {
                return RedirectToAction("Login");
            }

            var orders = await _context.Orders
                .Where(o => o.UserId == user.Id)
                .OrderByDescending(o => o.OrderDate)
                .Select(o => new OrderViewModel
                {
                    Id = "#" + o.Id.ToString(),
                    Date = o.OrderDate,
                    Status = o.Status,
                    Total = o.TotalAmount
                })
                .ToListAsync();

            var model = new ProfileViewModel()
            {
                FullName = user.FullName,
                Email = user.Email,
                PhoneNumber = user.PhoneNumber,
                MemberSince = "GlowCare Member", 
                OrderHistory = orders 
            };

            return View(model);
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        [Microsoft.AspNetCore.Authorization.Authorize]
        public async Task<IActionResult> Profile(ProfileViewModel model)
        {
            if (!ModelState.IsValid) return View(model);

            var user = await _userManager.GetUserAsync(User);
            if (user == null) return RedirectToAction("Login");

            user.FullName = model.FullName;
            user.PhoneNumber = model.PhoneNumber;

            var result = await _userManager.UpdateAsync(user);
            if (result.Succeeded)
            {
                TempData["Success"] = "Profile updated successfully";
                return RedirectToAction("Profile");
            }

            foreach (var error in result.Errors)
            {
                ModelState.AddModelError("", error.Description);
            }

            return View(model);
        }

        [HttpPost]
        public async Task<IActionResult> Logout()
        {
            await _signInManager.SignOutAsync();
            TempData["Success"] = "You have been signed out successfully. Come back soon!";
            return RedirectToAction("HomePage", "User");
        }

        public IActionResult AccessDenied()
        {
            return View();
        }

        private async Task MergeSessionCartToDbAsync(string userId)
        {
            var sessionItems = HttpContext.Session.GetObjectFromJson<List<SessionCartItem>>("SessionCart");
            if (sessionItems != null && sessionItems.Any())
            {
                foreach (var sessionItem in sessionItems)
                {
                    var dbItem = await _context.CartItems
                        .FirstOrDefaultAsync(c => c.UserId == userId && c.ProductId == sessionItem.ProductId);

                    if (dbItem != null)
                    {
                        dbItem.Quantity += sessionItem.Quantity;
                    }
                    else
                    {
                        var newItem = new CartItem
                        {
                            UserId = userId,
                            ProductId = sessionItem.ProductId,
                            Quantity = sessionItem.Quantity
                        };
                        _context.CartItems.Add(newItem);
                    }
                }
                await _context.SaveChangesAsync();
                HttpContext.Session.Remove("SessionCart");
            }
        }
    }
}
