# Running v8-v7 Benchmarks in mpv Player

[**mpv-v8v7**](https://github.com/ahaoboy/mpv-v8v7) is a JavaScript script for running **v8-v7** benchmark tests directly inside the [mpv player](https://mpv.io/).

The original benchmark code comes from [mozilla/arewefastyet](https://github.com/mozilla/arewefastyet/tree/master/benchmarks/v8-v7), and has been **bundled and converted into a CommonJS format** compatible with mpv using [ahaoboy/js-engine-benchmark](https://github.com/ahaoboy/js-engine-benchmark).

---

## 📜 How It Works

1. **When mpv starts**, the script automatically pauses video playback.
2. It **runs the v8-v7 benchmark test**.
3. The **test results** are displayed on-screen via mpv’s **OSD** (On-Screen Display).
4. Once completed, the results are **saved to a log file**: `scripts/mpv-v8v7-<timestamp>.log`

---

## 💡 Why Run This Benchmark?

The **v8-v7 benchmark** is designed to evaluate **JavaScript engine performance**.

* **Higher scores** mean faster JavaScript execution.
* Developers can use this test to compare the effects of different compilation options (e.g., **PGO**, **MIMALLOC**) on JS execution speed.

This makes it especially useful for performance tuning and testing custom mpv builds.

---

## 📦 Requirements

* **mpv** with **JavaScript scripting enabled**.

---

## ⚙️ Installation

1. **Download** the latest `portable_config.zip` from:
   [mpv-build](https://mpv-easy.github.io/mpv-build/#mpv-build=%22%7B%5C%22state%5C%22%3A%7B%5C%22selectedRowKeys%5C%22%3A%5B%5C%22mpv-v8v7%5C%22%5D%2C%5C%22externalList%5C%22%3A%5B%5D%2C%5C%22ui%5C%22%3A%5C%22osc%5C%22%2C%5C%22platform%5C%22%3A%5C%22mpv-v3%5C%22%7D%7D%22)

2. **Extract** `portable_config.zip` into your local **mpv directory**.

3. To avoid interference, it’s recommended to **install only this script** for testing purposes.

---

## 📝 Example Output

When the benchmark runs, mpv will pause playback and display results like:

```
v8-v7 Benchmark Results:
Score: 12345
Time: 678 ms
```

The full details are stored in `scripts/mpv-v8v7-<timestamp>.log`.

---

## 🔗 Related Projects

* [mozilla/arewefastyet](https://github.com/mozilla/arewefastyet) — Original benchmark suite.
* [ahaoboy/mpv-v8v7](https://github.com/ahaoboy/mpv-v8v7) — mpv script.
* [ahaoboy/js-engine-benchmark](https://github.com/ahaoboy/js-engine-benchmark) — Tool used to bundle and convert the benchmark to CommonJS format.
