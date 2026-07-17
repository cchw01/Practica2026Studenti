using Backend.DataManagement;
using Backend.DTOs;
using Backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;


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
        public ActionResult<List<CategoryDto>> GetCategories()
        {
            try
            {
                var categories = dataOps.GetCategories();
                var dtos = categories.Select(c => new CategoryDto
                {
                    Id = c.id,
                    Name = c.name
                }).ToList();
                return Ok(dtos);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
      
        [HttpGet("{id}")]
        public ActionResult<CategoryDto> GetCategoryById(int id)
        {
            try
            {
                var category = dataOps.GetCategoryById(id);
                if (category == null) return NotFound();
                var dto = new CategoryDto
                {
                    Id = category.id,
                    Name = category.name
                };
                return Ok(dto);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
        
        [HttpPost]
        public ActionResult<CategoryDto> AddCategory(CategoryCreateDto dto)
        {
            var category = new CategoryItem
            {
                name = dto.Name
            };
            dataOps.AddCategory(category);
            var result = new CategoryDto { Id = category.id, Name = category.name };
            return Ok(result);
        }
      
        [HttpPut]
        public ActionResult UpdateCategory(CategoryDto dto)
        {
            try
            {
                var category = new CategoryItem
                {
                    id = dto.Id,
                    name = dto.Name
                };
                dataOps.UpdateCategory(category);
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

