using Backend.Models;
namespace Backend.DataManagement
{
    public class ProfilePictureDataOps
    {
        private readonly ApplicationDbContext dbContext;
        public ProfilePictureDataOps(ApplicationDbContext context)
        {
            dbContext = context;
        }

        public void AddPicture(ProfilePicture profilePicture)
        {
            dbContext?.ProfilePictures.Add(profilePicture);
            dbContext?.SaveChanges();
        }
        public void DeletePicture(int pictureId)
        {
            var picture = dbContext?.ProfilePictures.Where(x => x.Id == pictureId).FirstOrDefault();
            if(picture!=null)
            {
                dbContext?.Remove(picture);
                dbContext.SaveChanges();
            }
        }
        public ProfilePicture? GetProfilePictureById(int pictureId)
        {
            return dbContext?.ProfilePictures.Where(x => x.Id == pictureId).FirstOrDefault();
        }
    }
}
