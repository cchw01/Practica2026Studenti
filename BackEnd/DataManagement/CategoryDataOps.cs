using Backend.DataManagement;
using Backend.Models;

namespace Backend.DataManagement
{
    public class CategoryDataOps
    {
        private readonly ApplicationDbContext DbContext;
        public CategoryDataOps(ApplicationDbContext context)
        {
            DbContext = context;
        }

        public CategoryItem[] GetCategories()
        {
            return DbContext.Category.ToArray();
        }

        public void AddCategory(CategoryItem category)
        {
            DbContext.Category.Add(category);
            DbContext.SaveChanges();
        }

        public bool DeleteCategory(int id)
        {
            var category = DbContext.Category.Where(x => x.id == id).FirstOrDefault();

            if (category != null)
            {
                DbContext.Category.Remove(category);
                DbContext.SaveChanges();
                return true;
            }

            return false;
        }

        public bool UpdateCategory(CategoryItem category)
        {
            var categoryToUpdate = DbContext.Category.Where(x => x.id == category.id).FirstOrDefault();

            if (categoryToUpdate != null)
            {
                categoryToUpdate.name = category.name;
                DbContext.SaveChanges();
                return true;
            }
            return false;

        }

        public CategoryItem? GetCategoryById(int id)
        {
            var categoryItem = DbContext.Category.Where(x => x.id == id).FirstOrDefault();
            return categoryItem;
        }
    }
}
