using Backend.DataManagement;
using Backend.DTOs;
using Backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CategoryController : ControllerBase
    {
        private readonly CategoryDataOps dataOps;

        public CategoryController(ApplicationDbContext dbContext)
        {
            dataOps = new CategoryDataOps(dbContext);
        }

        [HttpGet]
        public ActionResult<List<CategoryDto>> GetCategories()
        {
            var categories = dataOps.GetCategories();

            var result = categories.Select(MapToDto).ToList();

            return Ok(result);
        }

        [HttpGet("{id}")]
        public ActionResult<CategoryDto> GetCategoryById(int id)
        {
            var category = dataOps.GetCategoryById(id);

            if (category == null)
            {
                return NotFound( "CCategory not found");
            }

            return Ok(MapToDto(category));
        }

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public ActionResult<CategoryDto> AddCategory(
            [FromBody] CategoryCreateDto dto
        )
        {
            try
            {
                var category = new CategoryItem
                {
                    name = dto.Name,
                    description = dto.Description
                };

                var createdCategory = dataOps.AddCategory(category);
                var result = MapToDto(createdCategory);

                return CreatedAtAction( nameof(GetCategoryById), new { id = createdCategory.id }, result);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(ex.Message);
            }
        }

        [HttpPut]
        [Authorize(Roles = "Admin")]
        public ActionResult<CategoryDto> UpdateCategory(
            [FromBody] CategoryDto dto
        )
        {
            try
            {
                var category = new CategoryItem
                {
                    id = dto.Id,
                    name = dto.Name,
                    description = dto.Description
                };

                var updatedCategory =
                    dataOps.UpdateCategory(category);

                if (updatedCategory == null)
                {
                    return NotFound("Category not found");
                }

                return Ok(MapToDto(updatedCategory));
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(ex.Message);
            }
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public ActionResult DeleteCategory(int id)
        {
            try
            {
                bool deleted = dataOps.DeleteCategory(id);

                if (!deleted)
                {
                    return NotFound("Category not found");
                }

                return NoContent();
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(ex.Message);
            }
        }

        private static CategoryDto MapToDto(
            CategoryItem category
        )
        {
            return new CategoryDto
            {
                Id = category.id,
                Name = category.name,
                Description = category.description
            };
        }
    }
}