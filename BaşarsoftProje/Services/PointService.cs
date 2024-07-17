using System.Collections.Generic;
using System.Linq;
using BaşarsoftProje.Data;
using Microsoft.EntityFrameworkCore;
using System;

namespace BaşarsoftProje.Services
{
    public class PointService : IPointService
    {
        private readonly PointContext _context;

        public PointService(PointContext context)
        {
            _context = context;
        }

        public List<Point> GetAll()
        {
            return _context.Points.ToList();
        }

        public Point Add(Point point)
        {
            try
            {
                _context.Points.Add(point);
                _context.SaveChanges();
                return point;
            }
            catch (Exception ex)
            {
                return null;
            }
        }

        public Point GetById(int id)
        {
            try
            {
                return _context.Points.Find(id);
            }
            catch (Exception ex)
            {
                return null;
            }
        }

        public string Delete(int id)
        {
            try
            {
                var point = _context.Points.Find(id);
                if (point == null)
                {
                    return "Point not found";
                }
                _context.Points.Remove(point);
                _context.SaveChanges();
                return "Point deleted successfully";
            }
            catch (Exception ex)
            {
                return $"Error: {ex.Message}";
            }
        }

        public string Update(int id, Point newPoint)
        {
            try
            {
                var point = _context.Points.Find(id);
                if (point == null)
                {
                    return "Point not found";
                }
                point.X = newPoint.X;
                point.Y = newPoint.Y;
                point.Name = newPoint.Name;
                _context.SaveChanges();
                return "Point updated successfully";
            }
            catch (Exception ex)
            {
                return $"Error: {ex.Message}";
            }
        }
    }
}
