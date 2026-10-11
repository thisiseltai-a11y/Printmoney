#!/usr/bin/env python3
"""Run the pure-Lua gameplay tests outside Roblox Studio.

    pip install lupa
    python3 spot-kick/tests/run_tests.py            # syntax-check every script + run specs
    python3 spot-kick/tests/run_tests.py --balance  # also print keeper save rates per stage

The shared modules use `require(script.Parent.X)` like normal Roblox code. The
shim below fakes `script` and `require` so they load under stock Lua.
"""
import pathlib
import sys

import lupa

ROOT = pathlib.Path(__file__).resolve().parent.parent
SHARED = ROOT / "src" / "shared"

SHIM = r"""
local sources, cache = ...
local fakeParent = setmetatable({}, { __index = function(_, name) return { __module = name } end })
local realRequire = require
function require(target)
  if type(target) == "table" and target.__module then
    local name = target.__module
    if cache[name] == nil then
      local src = sources[name]
      assert(src, "no shared module " .. name)
      local chunk = assert(load(src, "@" .. name .. ".lua", "t", setmetatable({ script = { Parent = fakeParent } }, { __index = _G })))
      cache[name] = chunk()
    end
    return cache[name]
  end
  return realRequire(target)
end
script = { Parent = fakeParent }
"""


def syntax_check(lua):
    """Compile (without running) every .lua file so typos fail fast."""
    failures = 0
    load = lua.eval("function(src, name) local f, err = load(src, name) return err end")
    for path in sorted((ROOT / "src").rglob("*.lua")):
        err = load(path.read_text(), "@" + str(path.relative_to(ROOT)))
        if err:
            print("SYNTAX", err)
            failures += 1
    return failures


def main():
    lua = lupa.LuaRuntime(unpack_returned_tuples=True)
    if syntax_check(lua):
        sys.exit(1)

    sources = lua.table_from({p.stem: p.read_text() for p in SHARED.glob("*.lua")})
    lua.execute(SHIM, sources, lua.table())

    specs = sorted((ROOT / "tests").glob("*_spec.lua"))
    lua.execute((ROOT / "tests" / "harness.lua").read_text())
    for spec in specs:
        lua.execute(spec.read_text())
    passed, failed = lua.eval("RunAll()")
    print(f"{passed} passed, {failed} failed")

    if "--balance" in sys.argv:
        lua.execute((ROOT / "tests" / "balance.lua").read_text())

    sys.exit(1 if failed else 0)


if __name__ == "__main__":
    main()
