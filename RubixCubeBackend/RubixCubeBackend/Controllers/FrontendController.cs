using Microsoft.AspNetCore.Mvc;

namespace RubixCubeBackend.Controllers;
[ApiController]
[Route("[controller]")]
public class FrontendController : ControllerBase
{
    private readonly ILogger<FrontendController> _logger;

    public FrontendController(ILogger<FrontendController> logger)
    {
        _logger = logger;
    }

    [HttpGet]
    [Route("/")]
    [Route("/Index")]
    [Route("/Index.html")]
    public IActionResult Index()
    {
        var path = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "Frontend", "index.html");
        var buffer = System.IO.File.ReadAllBytes(path);
        return File(buffer, "text/html");
    }

    [HttpGet]
    [Route("/css/{fileName}")]
    [Route("/js/{fileName}")]
    public IActionResult Root(string fileName)
    {
        if (!fileName.Contains(".")) return NotFound();
        try
        {
            string extension = fileName.Split('.').Last();
            var path = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "Frontend", GetFolder(extension), fileName);
            var buffer = System.IO.File.ReadAllBytes(path);
            return File(buffer, GetContentType(extension));
        }
        catch
        {
            return NotFound();
        }
    }

    private string GetFolder(string extension)
    {
        return extension switch
        {
            "js" => "js",
            "css" => "css",
            _ => throw new NotImplementedException()
        };
    }

    private string GetContentType(string extension)
    {
        return extension switch
        {
            "js" => "application/javascript",
            "json" => "application/json",
            "ico" => "image/x-icon",
            "png" => "image/png",
            "jpg" => "image/jpg",
            "css" => "text/css",
            _ => "plain/text"
        };
    }

}
