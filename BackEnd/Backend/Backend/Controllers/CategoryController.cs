using Backend.DataManagement;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Mvc;
using Backend.Models;
using Backend.Data;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CategoryController : ControllerBase
    {
        private readonly CategoryDataOps dataOps;
        public CategoryController(ApplicationDbContext DbContext)
        {
            dataOps = new CategoryDataOps(DbContext);
        }

        [HttpGet]
        public ActionResult<CategoryItem> GetCategories()
        {
            try
            {
                var categories = dataOps.GetCategories();
                return Ok(categories);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpGet("{id}")]
        public ActionResult<Review> GetCategoryById(int id)
        {
            try
            {
                var category = dataOps.GetCategoryById(id);

                if (category == null)
                    return NotFound();

                return Ok(category);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPost]
        public ActionResult<CategoryItem> AddInventoryItem(CategoryItem category)
        {
            dataOps.AddCategory(category);
            return Ok();
        }

        [HttpPut]
        public ActionResult UpdateCategory(CategoryItem categoryItem)
        {
            try
            {
                dataOps.UpdateCategory(categoryItem);
                return Ok();
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpDelete("{id}")]
        public ActionResult DeleteCategory(int id)
        {
            try
            {
                dataOps.DeleteCategory(id);
                return Ok();
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }
}

