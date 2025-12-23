# Copy Reference JetBrains for VS Code

[![GitHub Release](https://img.shields.io/github/v/release/yipclara/copy-reference-jetbrains-pytest?style=flat-square)](https://github.com/yipclara/copy-reference-jetbrains-pytest/releases)

A VS Code extension that brings JetBrains-style "Copy Reference" functionality specifically for **Python (pytest)**. Right-click on any Python symbol (class, method, function) to copy its pytest-style reference (e.g., `module::Class::method`) to your clipboard.


## ✨ Features

- **Pytest-style references**: Produces JetBrains-style test identifiers such as `tests.test_example::TestThing::test_it`.
- **Python module/package detection**: Resolves package/module paths from your workspace layout (special-cases `__init__.py`).
- **Test-friendly output**: Useful for running single tests with `pytest` using file node IDs (e.g., `pytest tests/test_example.py::TestThing::test_it`).
- **Context menu integration**: Right-click on a Python symbol to copy its reference
- **Instant clipboard copy**: Copies the reference to your system clipboard immediately.

## 🚀 Installation

### Option 1: VS Code Marketplace (Recommended)

The easiest way to install:

1. **Open VS Code**
2. **Go to Extensions** (Ctrl/Cmd + Shift + X)
3. **Search for "Copy Reference - Pytest"** (published by Clara Yip)
4. **Click Install**

> **Note:** This extension requires a Python language extension (for example, **Pylance** or the Microsoft Python extension) to provide symbol information. Make sure the Python extension is installed and enabled in VS Code (and in the Extension Development Host when running in dev mode).

[![Install from GitHub Releases](https://img.shields.io/badge/Download-VSIX-blue?style=for-the-badge&logo=github)](https://github.com/yipclara/copy-reference-jetbrains-pytest/releases)

### Option 2: Manual Installation from GitHub

For early access or offline installation:

1. **Download the latest VSIX file** from our [GitHub Releases](https://github.com/yipclara/copy-reference-jetbrains-pytest/releases)
2. **Open VS Code**
3. **Go to Extensions panel** (Ctrl/Cmd + Shift + X)
4. **Click the "..." menu** in the Extensions panel
5. **Select "Install from VSIX..."**
6. **Navigate to the downloaded `.vsix` file** and select it
7. **Click Install**

### Troubleshooting Installation

**Extension not appearing?**
- Restart VS Code after installation
- Check if the extension is enabled in the Extensions panel
- Ensure you have a Python file open
- Make sure a Python language extension (e.g., Pylance) is installed and active — the extension relies on the language provider for document symbols

**Can't find "Copy Reference" in context menu?**
- Make sure you're right-clicking on a Python symbol (class, method, function)
- Try clicking directly on the symbol name, not whitespace

## 📖 Usage

1. **Right-click** on any symbol in your code
2. **Select "Copy Reference"** from the context menu
3. **Paste** the full dot notation path wherever you need it

### Django Testing Example

Perfect for Django testing workflows:

```python
# In myapp/tests/test_models.py
class UserModelTest(TestCase):
    def test_user_creation(self):
        # Right-click on 'test_user_creation' → Copy Reference
        pass
```

**Copied result**: `myapp.tests.test_models.UserModelTest.test_user_creation`

**Use in terminal**:
```bash
python manage.py test myapp.tests.test_models.UserModelTest.test_user_creation
```

## 📋 Example Outputs

### Python
```python
# myproject/myapp/models.py
class User:
    def get_full_name(self):
        pass
```
**Copy Reference result**: `myproject.myapp.models::User::get_full_name`



## 🔧 Supported Languages

- **Python (pytest)** - Full module and test node support (module::Class::method)**

## 🎯 Use Cases

- **Django Testing**: Generate precise test paths for `pytest`
- **Code Documentation**: Reference specific methods in documentation
- **Code Reviews**: Provide exact paths when discussing code
- **Debugging**: Quickly reference problematic methods

## 🤝 Contributing

Found a bug or want to contribute? 

1. Visit our [GitHub repository](https://github.com/yipclara/copy-reference-jetbrains-pytest)
2. Open an issue or submit a pull request
3. Help make this extension even better!

## 🙏 Acknowledgements

This project is a pytest-focused fork inspired by and building upon the original "Copy Reference" extension by **Aaron Kazah**. Many thanks to Aaron for the idea and initial implementation — see the original project: https://github.com/aaronkazah/copy-reference-jetbrains

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

---

🐛 **Found an issue?** [Report it here](https://github.com/yipclara/copy-reference-jetbrains-pytest/issues)

📧 **Questions?** [Start a discussion](https://github.com/yipclara/copy-reference-jetbrains-pytest/discussions)
