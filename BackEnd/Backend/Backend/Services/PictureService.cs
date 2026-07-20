using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using System;
using System.IO;
using System.Threading.Tasks;

public class PictureService
{
    private readonly IWebHostEnvironment _env;

    public PictureService(IWebHostEnvironment env)
    {
        _env = env;
    }

    public async Task<string> SavePicture(IFormFile picture, string fileName)
    {
        if (picture == null || picture.Length == 0)
        {
            throw new ArgumentException("Fișierul încărcat este gol sau nevalid.");
        }

        
        string webRoot = _env.WebRootPath
                         ?? Path.Combine(_env.ContentRootPath, "wwwroot");
        
        string folderPath = Path.Combine(webRoot, "Pictures");
        
        if (!Directory.Exists(folderPath))
        {
            Directory.CreateDirectory(folderPath);
        }

        string filePath = Path.Combine(folderPath, fileName);

        using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await picture.CopyToAsync(stream);
        }

        return fileName;
    }

    public bool DeletePicture(string fileName)
    {
        string webRoot = _env.WebRootPath
                         ?? Path.Combine(_env.ContentRootPath, "wwwroot");

        string fullPath = Path.Combine(webRoot, "Pictures", fileName);

        if (File.Exists(fullPath))
        {
            File.Delete(fullPath);
            return true;
        }

        return false;
    }
}