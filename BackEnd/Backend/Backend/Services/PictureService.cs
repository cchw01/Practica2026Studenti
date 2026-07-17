using Microsoft.AspNetCore.Hosting;
using System.IO;

public class PictureService
{
    private readonly IWebHostEnvironment _env;
    public PictureService(IWebHostEnvironment env)
    {
        _env = env;
    }
    public async void SavePicture(IFormFile picture, string name)
    {
        string picturesPath = Path.Combine(_env.WebRootPath, "Pictures", name);
        if (!Directory.Exists(picturesPath))
        {
            Directory.CreateDirectory(picturesPath);
        }
        using (var stream = new FileStream(picturesPath, FileMode.Create))
        {
            await  picture.CopyToAsync(stream);
        }
    }
    public bool DeletePicture(string name)
    {
        string fullPath = Path.Combine(_env.WebRootPath, "Pictures", name);
        if (File.Exists(fullPath))
        {
            File.Delete(fullPath);
            return true;
        }
        else return false;
    }
}