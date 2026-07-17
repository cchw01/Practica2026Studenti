using Backend.Models;

namespace Backend.DataManagement
{
    public class PictureDataOps
    {
        private readonly ApplicationDbContext dbContext;

        public PictureDataOps(ApplicationDbContext context)
        {
            dbContext = context;
        }

        public Picture? GetPictureById(int id)
        {
            return dbContext?.Pictures.Where(x => x.Id == id).FirstOrDefault();
        }
        public void AddPicture(Picture picture)
        {
            dbContext?.Pictures.Add(picture);
            dbContext?.SaveChanges();
        }
        public void DeletePicture(int id)
        {
            var picture = dbContext?.Pictures.Where(x => x.Id == id).FirstOrDefault();
            if (picture != null)
            {
                dbContext?.Pictures.Remove(picture);
                dbContext?.SaveChanges();
            }
        }
        public void UpdatePicture(Picture picture)
        {
            dbContext?.Pictures.Update(picture);
            dbContext?.SaveChanges();
        }
    }
}
