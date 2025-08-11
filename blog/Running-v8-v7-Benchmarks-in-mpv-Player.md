# Running v8-v7 Benchmarks in mpv Player

[**mpv-v8v7**](https://github.com/ahaoboy/mpv-v8v7) is a JavaScript script for running **v8-v7** benchmark tests directly inside the [mpv player](https://mpv.io/).

The original benchmark code comes from [mozilla/arewefastyet](https://github.com/mozilla/arewefastyet/tree/master/benchmarks/v8-v7), and has been **bundled and converted into a CommonJS format** compatible with mpv using [ahaoboy/js-engine-benchmark](https://github.com/ahaoboy/js-engine-benchmark).

<div style="display: flex;" align="center">
  <img src="https://github.com/user-attachments/assets/47638d12-c6d2-4c5a-b958-71c34f1c0b5d" alt="pgo" width="45%"/>
  <img src="https://github.com/user-attachments/assets/efb63002-7ea2-474b-b8f3-113d9cb39706" alt="origin" width="45%"/>
</div>

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
Richards: 526
DeltaBlue: 766
Crypto: 366
RayTrace: 1085
EarleyBoyer: 1300
RegExp: 513
Splay: 2380
NavierStokes: 957
----
Score: 838
```

The full details are stored in `scripts/mpv-v8v7-<timestamp>.log`.

## bench mpv-x86_64-v3

### https://github.com/zhongfly/mpv-winbuild

<img width="960" height="540" alt="image" src="https://github.com/user-attachments/assets/32e37ce6-cc15-4c86-8964-afd587aae2eb" />

### https://github.com/shinchiro/mpv-winbuild-cmake

<img width="960" height="540" alt="image" src="https://github.com/user-attachments/assets/4c4c6988-c8d9-4906-b49c-80c059123706" />

### https://github.com/Andarwinux/mpv-winbuild
<img width="960" height="540" alt="image" src="https://github.com/user-attachments/assets/42aba3b4-d5d9-414a-8c34-b5ecef7c2b66" />



---

## 🔗 Related Projects

* [mozilla/arewefastyet](https://github.com/mozilla/arewefastyet) — Original benchmark suite.
* [ahaoboy/mpv-v8v7](https://github.com/ahaoboy/mpv-v8v7) — mpv script.
* [ahaoboy/js-engine-benchmark](https://github.com/ahaoboy/js-engine-benchmark) — Tool used to bundle and convert the benchmark to CommonJS format.


