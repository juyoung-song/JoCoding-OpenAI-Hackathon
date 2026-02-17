from __future__ import annotations

import asyncio
import inspect


def pytest_configure(config) -> None:
    config.addinivalue_line("markers", "asyncio: mark test as asyncio coroutine")


def pytest_pyfunc_call(pyfuncitem):
    if "asyncio" not in pyfuncitem.keywords:
        return None
    test_fn = pyfuncitem.obj
    if not inspect.iscoroutinefunction(test_fn):
        return None

    kwargs = {name: pyfuncitem.funcargs[name] for name in pyfuncitem._fixtureinfo.argnames}
    asyncio.run(test_fn(**kwargs))
    return True
