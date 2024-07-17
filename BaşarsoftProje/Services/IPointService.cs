namespace BaşarsoftProje.Services
{
    public interface IPointService
    {
        List<Point> GetAll();
        Point Add(Point point);
        Point GetById(int id);
        string Delete(int id);
        string Update(int id, Point newPoint);
    }
}
