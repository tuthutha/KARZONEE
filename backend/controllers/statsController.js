import Car from '../models/carModel.js';
import Booking from '../models/bookingModel.js';

const getWeekNumber = (date) => {
  const d = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()),
  );
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
  return {
    year: d.getUTCFullYear(),
    week: weekNo,
  };
};

export const getDashboardStats = async (req, res) => {
  try {
    const [cars, bookings] = await Promise.all([
      Car.find({}),
      Booking.find({}),
    ]);

    const totalCars = cars.length;

    const availableCars = cars.filter(
      (car) => String(car.status || '').toLowerCase() === 'available',
    ).length;

    const totalBookings = bookings.length;

    const totalRevenue = bookings.reduce((sum, booking) => {
      return sum + Number(booking.amount || 0);
    }, 0);

    const bookingStatus = bookings.reduce(
      (acc, booking) => {
        const status = String(booking.status || 'pending').toLowerCase();
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      },
      { pending: 0, confirmed: 0, completed: 0, cancelled: 0 },
    );

    const carMap = {};

    for (const booking of bookings) {
      const carId =
        booking.car?._id?.toString?.() ||
        booking.car?.toString?.() ||
        booking.carSnapshot?._id?.toString?.() ||
        booking.carName ||
        'unknown';

      const carName = booking.carSnapshot
        ? `${booking.carSnapshot.make || ''} ${booking.carSnapshot.model || ''}`.trim()
        : booking.carName ||
          (typeof booking.car === 'object'
            ? `${booking.car.make || ''} ${booking.car.model || ''}`.trim()
            : 'Xe không xác định');

      if (!carMap[carId]) {
        carMap[carId] = {
          carName,
          bookingCount: 0,
          revenue: 0,
        };
      }

      carMap[carId].bookingCount += 1;
      carMap[carId].revenue += Number(booking.amount || 0);
    }

    const topCars = Object.values(carMap)
      .sort((a, b) => b.bookingCount - a.bookingCount)
      .slice(0, 5);

    const monthMap = {};
    const weekMap = {};
    const yearMap = {};

    bookings.forEach((booking) => {
      const dateValue =
        booking.bookingDate || booking.createdAt || booking.pickupDate;

      const date = new Date(dateValue);
      if (isNaN(date)) return;

      const revenue = Number(booking.amount || 0);

      // Theo tháng
      const monthKey = `${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
      if (!monthMap[monthKey]) {
        monthMap[monthKey] = { month: monthKey, bookings: 0, revenue: 0 };
      }
      monthMap[monthKey].bookings += 1;
      monthMap[monthKey].revenue += revenue;

      // Theo tuần
      const { year, week } = getWeekNumber(date);
      const weekKey = `Tuần ${String(week).padStart(2, '0')}/${year}`;
      if (!weekMap[weekKey]) {
        weekMap[weekKey] = {
          week: weekKey,
          year,
          weekNumber: week,
          bookings: 0,
          revenue: 0,
        };
      }
      weekMap[weekKey].bookings += 1;
      weekMap[weekKey].revenue += revenue;

      // Theo năm
      const yearKey = String(date.getFullYear());
      if (!yearMap[yearKey]) {
        yearMap[yearKey] = { year: yearKey, bookings: 0, revenue: 0 };
      }
      yearMap[yearKey].bookings += 1;
      yearMap[yearKey].revenue += revenue;
    });

    const revenueByMonth = Object.values(monthMap).sort((a, b) => {
      const [am, ay] = a.month.split('/').map(Number);
      const [bm, by] = b.month.split('/').map(Number);
      return new Date(ay, am - 1) - new Date(by, bm - 1);
    });

    const revenueByWeek = Object.values(weekMap).sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year;
      return a.weekNumber - b.weekNumber;
    });

    const revenueByYear = Object.values(yearMap).sort(
      (a, b) => Number(a.year) - Number(b.year),
    );

    res.status(200).json({
      summary: {
        totalCars,
        availableCars,
        totalBookings,
        totalRevenue,
      },
      bookingStatus,
      topCars,
      revenueByMonth,
      revenueByWeek,
      revenueByYear,
    });
  } catch (error) {
    console.error('getDashboardStats error:', error);
    res.status(500).json({
      message: 'Lỗi khi lấy dữ liệu thống kê',
      error: error.message,
    });
  }
};
