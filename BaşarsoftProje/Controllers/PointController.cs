using Microsoft.AspNetCore.Mvc;
using BaşarsoftProje.Services;
using System.Collections.Generic;

namespace BaşarsoftProje.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PointController : ControllerBase
    {
        private readonly IPointService _pointService;

        public PointController(IPointService pointService)
        {
            _pointService = pointService;
        }

        [HttpGet]
        public ActionResult<List<Point>> GetAll()
        {
            return Ok(_pointService.GetAll());
        }

        [HttpPost]
        public ActionResult<Point> Add([FromBody] Point point)
        {
            if (point == null)
            {
                return BadRequest("Point is null.");
            }

            var result = _pointService.Add(point);
            if (result == null)
            {
                return StatusCode(500, "An error occurred while adding the point.");
            }

            return CreatedAtAction(nameof(GetById), new { id = point.Id }, point);
        }

        [HttpGet("{id}")]
        public ActionResult<Point> GetById(int id)
        {
            var point = _pointService.GetById(id);
            if (point == null)
            {
                return NotFound();
            }
            return Ok(point);
        }

        [HttpDelete("{id}")]
        public ActionResult Delete(int id)
        {
            var result = _pointService.Delete(id);
            if (result.StartsWith("Error"))
            {
                return StatusCode(500, result);
            }
            if (result == "Point not found")
            {
                return NotFound(result);
            }
            return NoContent();
        }

        [HttpPut("{id}")]
        public ActionResult Update(int id, [FromBody] Point newPoint)
        {
            if (newPoint == null)
            {
                return BadRequest("New Point is null.");
            }

            var result = _pointService.Update(id, newPoint);
            if (result.StartsWith("Error"))
            {
                return StatusCode(500, result);
            }
            if (result == "Point not found")
            {
                return NotFound(result);
            }
            return NoContent();
        }
    }
}
