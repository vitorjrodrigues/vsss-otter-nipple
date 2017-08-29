#ifndef SIGMA_DELTA_SPEED_H
#define SIGMA_DELTA_SPEED_H

#include <stdint.h>
#include <type_traits>

template <typename _T, _T _prd, uint32_t _fwd_pin, uint32_t _rwd_pin>
class sigma_delta_speed {
	static_assert(std::is_signed<_T>(), "T must be signed.");
public:
	typedef _T T;
	enum : uint32_t {
		fwd_pin = _fwd_pin,
		rwd_pin = _rwd_pin,
		fwd_mask = 1 << fwd_pin,
		rwd_mask = 1 << rwd_pin,
		mask = fwd_mask | rwd_mask
	};
	enum : T {
		prd = _prd
	};
	
private:
	T _speed, _acc;
	
public:
	sigma_delta_speed() :
		_speed(0), _acc(0)
	{
	}
	
	void setSpeed(T s) {
		_speed = s;
	}
	
	T speed() const {
		return _speed;
	}
	
	uint32_t operator()() {
		uint32_t r = 0;
		_acc += _speed;
		if (_acc > +prd/2) {
			_acc -= prd;
			r |= fwd_mask;
		}
		if (_acc < -prd/2) {
			_acc += prd;
			r |= rwd_mask;
		}
		return r;
	}
};

#endif
