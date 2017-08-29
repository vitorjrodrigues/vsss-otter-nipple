#ifndef QUADRATURE_DECODER_H
#define QUADRATURE_DECODER_H

#include <stdint.h>
#include <type_traits>
#include <FreeRTOS.h>

template <typename _T, _T _prd,  uint32_t _a_pin, uint32_t _b_pin>
class quadrature_decoder {
	static_assert(std::is_signed<_T>(), "T must be a signed type.");
public:
	typedef _T T;
	enum : uint32_t {
		a_pin  = _a_pin,
		b_pin  = _b_pin,
		a_mask = 1 << a_pin,
		b_mask = 1 << b_pin,
		mask   = a_mask | b_mask
	};
	enum : T {
		prd = _prd
	};
	
private:
	uint32_t old;
	T _abs, _dif;
	T da, db;
	
public:
	void reset(uint32_t in, T npos) {
		vPortEnterCritical();
		old  = in;
		_abs = npos;
		_dif = 0;
		da   = in & a_mask ? +1 : -1;
		db   = in & b_mask ? +1 : -1;
		vPortExitCritical();
	}
	void operator() (uint32_t in) {
		in  ^= old;
		old ^= in;
		
		if (in & a_mask) {
			_abs += da;
			_dif += da;
			da = -da;
		}
		if (in & b_mask) {
			_abs += db;
			_dif += db;
			db = -db;
		}
		
		if (_abs == prd)
			_abs -= prd;
		if (_abs < 0)
			_abs += prd;
	}
	T abs() const {
		return _abs;
	}
	T diff() const {
		vPortEnterCritical();
		uint32_t d = _dif;
		_dif = 0;
		vPortExitCritical();
		return d;
	}
};

#endif
