using Backend.Models;
using Microsoft.EntityFrameworkCore;

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
            return DbContext.Category.AsNoTracking().OrderBy(category => category.name).ToArray();
        }



        public CategoryItem? GetCategoryById(int id)
        {
            return DbContext.Category.AsNoTracking().FirstOrDefault(category => category.id == id);
        }

        public CategoryItem AddCategory(CategoryItem category)
        {
            category.name = category.name.Trim();
            category.description = category.description.Trim();

            if (string.IsNullOrWhiteSpace(category.name))
            {
                throw new ArgumentException("Numele categoriei este obligatoriu.");
            }

            bool categoryExists = DbContext.Category.Any(existingCategory => existingCategory.name.ToLower() == category.name.ToLower()
            );

            if (categoryExists)
            {
                throw new InvalidOperationException("Există deja o categorie cu acest nume.");
            }

            DbContext.Category.Add(category);
            DbContext.SaveChanges();

            return category;
        }

        public CategoryItem? UpdateCategory(CategoryItem category)
        {
            string normalizedName = category.name.Trim();
            string normalizedDescription = category.description.Trim();

            if (string.IsNullOrWhiteSpace(normalizedName))
            {
                throw new ArgumentException("Numele categoriei este obligatoriu.");
            }

            var categoryToUpdate = DbContext.Category.FirstOrDefault(existingCategory => existingCategory.id == category.id);

            if (categoryToUpdate == null)
            {
                return null;
            }

            bool nameAlreadyExists = DbContext.Category.Any(
                existingCategory =>
                existingCategory.id != category.id &&
                existingCategory.name.ToLower() ==
                normalizedName.ToLower()
            );

            if (nameAlreadyExists)
            {
                throw new InvalidOperationException("Există deja o altă categorie cu acest nume.");
            }

            categoryToUpdate.name = normalizedName;
            categoryToUpdate.description = normalizedDescription;

            DbContext.SaveChanges();

            return categoryToUpdate;
        }

        public bool DeleteCategory(int id)
        {
            var category = DbContext.Category.FirstOrDefault(existingCategory => existingCategory.id == id);

            if (category == null)
            {
                return false;
            }

            DbContext.Category.Remove(category);

            try
            {
                DbContext.SaveChanges();
                return true;
            }
            catch (DbUpdateException)
            {
                throw new InvalidOperationException("Categoria nu poate fi ștearsă deoarece este utilizată de una sau mai multe licitații.");
            }
        }
    }
}