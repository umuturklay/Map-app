using System.Collections.Generic;
using System.Threading.Tasks;
using BaşarsoftProje.Models;
using BaşarsoftProje.Repositories;

namespace BaşarsoftProje.Services
{
    public class PointService : IPointService
    {
        private readonly IUnitOfWork _unitOfWork;

        public PointService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<List<Point>> GetAll()
        {
            return await _unitOfWork.Points.GetAllAsync();
        }

        public async Task<Point> Add(Point point)
        {
            try
            {
                var addedPoint = await _unitOfWork.Points.AddAsync(point);
                await _unitOfWork.CommitAsync();
                return addedPoint;
            }
            catch
            {
                return null;
            }
        }

        public async Task<Point> GetById(int id)
        {
            return await _unitOfWork.Points.GetByIdAsync(id);
        }

        public async Task<string> Delete(int id)
        {
            var result = await _unitOfWork.Points.DeleteAsync(id);
            if (!result)
            {
                return "Point not found";
            }

            await _unitOfWork.CommitAsync();
            return "Point deleted successfully";
        }

        public async Task<string> Update(int id, Point newPoint)
        {
            var existingPoint = await _unitOfWork.Points.GetByIdAsync(id);
            if (existingPoint == null)
            {
                return "Point not found";
            }

            existingPoint.X = newPoint.X;
            existingPoint.Y = newPoint.Y;
            existingPoint.Name = newPoint.Name;

            await _unitOfWork.Points.UpdateAsync(existingPoint);
            await _unitOfWork.CommitAsync();
            return "Point updated successfully";
        }
    }
}
