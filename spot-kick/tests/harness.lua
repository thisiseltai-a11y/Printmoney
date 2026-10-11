-- Minimal describe/it harness for the Python runner.
local tests = {}

function it(name, fn)
	table.insert(tests, { name = name, fn = fn })
end

function expectEq(actual, expected, msg)
	if actual ~= expected then
		error((msg or "expected equal") .. ": got " .. tostring(actual) .. ", want " .. tostring(expected), 2)
	end
end

function expect(cond, msg)
	if not cond then
		error(msg or "expectation failed", 2)
	end
end

-- Deterministic LCG so tests are reproducible.
function SeededRng(seed)
	local state = seed
	return function()
		state = (state * 1103515245 + 12345) % 2147483648
		return state / 2147483648
	end
end

function RunAll()
	local passed, failed = 0, 0
	for _, t in ipairs(tests) do
		local ok, err = pcall(t.fn)
		if ok then
			passed = passed + 1
		else
			failed = failed + 1
			print("FAIL " .. t.name .. "\n  " .. tostring(err))
		end
	end
	return passed, failed
end
