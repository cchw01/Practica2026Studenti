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

        public void DeleteCategory(int id)
        {
            var category = DbContext.Category.Where(x => x.id == id).FirstOrDefault();

            if (category != null)
            {
                DbContext.Category.Remove(category);
                DbContext.SaveChanges();
            }
        }

        public void UpdateCategory(CategoryItem category)
        {
            DbContext?.Category.Update(category);
            DbContext?.SaveChanges();
        }

        public CategoryItem? GetCategoryById(int id)
        {
            var categoryItem = DbContext.Category.Where(x => x.id == id).FirstOrDefault();
            return categoryItem;
        }
    }
}
