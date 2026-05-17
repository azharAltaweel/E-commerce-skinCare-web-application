using Microsoft.AspNetCore.Mvc;

namespace E_commerce_Website__Skincare_.Controllers
{
    public class CartController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }

        public IActionResult Checkout()
        {
            return View();
        }

        public IActionResult Payment()
        {
            return View();
        }
    }
}
