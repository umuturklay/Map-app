using System.Collections.Generic;
using System.Threading.Tasks;
using BaşarsoftProje.Models;

namespace BaşarsoftProje.Services
{
    public interface IPointService
    {
        Task<List<Point>> GetAll();
        Task<Point> Add(Point point);
        Task<Point> GetById(int id);
        Task<string> Delete(int id);
        Task<string> Update(int id, Point newPoint);
    }
}

