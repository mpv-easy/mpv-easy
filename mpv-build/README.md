**mpv-build**, a website that lets you build a custom MPV player right in your browser.

https://mpv-easy.github.io/mpv-build/

see more: [mpv-build: Customize your own MPV right from your browser](https://github.com/mpv-easy/mpv-easy/blob/main/blog/customize-your-own-mpv-right-from-your-browser.md)

https://github.com/user-attachments/assets/6858b854-c708-4458-b0a6-2d35bc1cb540

## Common UIs Download Links

- [uosc](https://mpv-easy.github.io/mpv-build/#mpv-build=%22%7B%5C%22state%5C%22%3A%7B%5C%22selectedRowKeys%5C%22%3A%5B%5C%22thumbfast%5C%22%5D%2C%5C%22externalList%5C%22%3A%5B%5D%2C%5C%22ui%5C%22%3A%5C%22uosc%5C%22%2C%5C%22platform%5C%22%3A%5C%22mpv-v3%5C%22%2C%5C%22repos%5C%22%3A%5B%5D%7D%7D%22) ([repo](https://github.com/tomasklaen/uosc))
- [mpv-easy](https://mpv-easy.github.io/mpv-build/#mpv-build=%22%7B%5C%22state%5C%22%3A%7B%5C%22selectedRowKeys%5C%22%3A%5B%5D%2C%5C%22externalList%5C%22%3A%5B%5D%2C%5C%22ui%5C%22%3A%5C%22mpv-easy%5C%22%2C%5C%22platform%5C%22%3A%5C%22mpv-v3%5C%22%2C%5C%22repos%5C%22%3A%5B%5D%7D%7D%22) ([repo](https://github.com/mpv-easy/mpv-easy))
- [ModernX](https://mpv-easy.github.io/mpv-build/#mpv-build=%22%7B%5C%22state%5C%22%3A%7B%5C%22selectedRowKeys%5C%22%3A%5B%5C%22thumbfast%5C%22%2C%5C%22autoload%5C%22%5D%2C%5C%22externalList%5C%22%3A%5B%5D%2C%5C%22ui%5C%22%3A%5C%22modernx%5C%22%2C%5C%22platform%5C%22%3A%5C%22mpv-v3%5C%22%2C%5C%22repos%5C%22%3A%5B%5D%7D%7D%22) ([repo](https://github.com/zydezu/ModernX))
- [ModernZ](https://mpv-easy.github.io/mpv-build/#mpv-build=%22%7B%5C%22state%5C%22%3A%7B%5C%22selectedRowKeys%5C%22%3A%5B%5C%22thumbfast%5C%22%2C%5C%22autoload%5C%22%5D%2C%5C%22externalList%5C%22%3A%5B%5D%2C%5C%22ui%5C%22%3A%5C%22modernz%5C%22%2C%5C%22platform%5C%22%3A%5C%22mpv-v3%5C%22%2C%5C%22repos%5C%22%3A%5B%5D%7D%7D%22) ([repo](https://github.com/Samillion/ModernZ))
- [ModernH](https://mpv-easy.github.io/mpv-build/#mpv-build=%22%7B%5C%22state%5C%22%3A%7B%5C%22selectedRowKeys%5C%22%3A%5B%5C%22autoload%5C%22%2C%5C%22thumbfast%5C%22%2C%5C%22ModernH%5C%22%5D%2C%5C%22externalList%5C%22%3A%5B%5D%2C%5C%22ui%5C%22%3A%5C%22osc%5C%22%2C%5C%22platform%5C%22%3A%5C%22mpv-v3%5C%22%2C%5C%22repos%5C%22%3A%5B%5D%7D%7D%22) ([repo](https://github.com/HarkeshBhatia/ModernH))


## mpv Version Differences

Prebuilt mpv binaries are sourced from [shinchiro/mpv-winbuild-cmake](https://github.com/shinchiro/mpv-winbuild-cmake).

| Version | Description | Recommendation |
|---------|-------------|----------------|
| **mpv-v3** | Compiled with `-march=x86-64-v3` (AVX2, BMI, FMA, etc.) for modern CPUs | ✅ Default choice, works on most CPUs from ~2013+ |
| **mpv** | Generic x86-64 build without v3 optimizations | For older CPUs that don't support AVX2 |
| **mpv-qjs** | Uses [QuickJS](https://github.com/mpv-player/mpv/pull/17179) instead of MuJS as the JavaScript runtime ([build](https://github.com/ahaoboy/mpv/actions/workflows/build.yml)) | For better JS compatibility and performance |
