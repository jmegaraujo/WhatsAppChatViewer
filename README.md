# WhatsApp Chat Parser <img src="images/favicon.ico" alt="WACP Logo" width="34" height="34" style="vertical-align: bottom">

A modern, user-friendly tool to parse and visualize WhatsApp chat exports. Convert your chat archives into a beautifully structured and readable format.

The site is open source (here's all the code!) and is a tool _for_ and _by_ the community.

Submit [issues](https://github.com/jmegaraujo/WhatsAppChatViewer/issues/new) and [pull requests](https://github.com/jmegaraujo/WhatsAppChatViewer/compare/) for bug reports, feature requests, or improvements.

## Features

- Support for both .txt and .zip WhatsApp chat exports
- Clean, modern interface with dark mode
- Media file support (images, videos, audio)
- Contact card (VCF) support
- Poll visualization
- End-to-end encryption notice preservation
- Responsive design for all devices
- Author filtering system

## Usage

1. Export your chat from WhatsApp:
   - Open the chat
   - Tap the three dots menu
   - Select "More" > "Export chat"
   - Choose whether to include media
   - Save the export file (.txt or .zip)

2. Upload your file:
   - Visit [WhatsApp Chat Parser](https://jmegaraujo.github.io/WhatsAppChatViewer/)
   - Click "Select File (.txt or .zip)"
   - Choose your exported chat file
   - The parser will automatically process and display your chat

3. View and interact:
   - Use the menu button to filter messages by author
   - View media inline
   - See polls with vote counts
   - Contact cards are displayed in a readable format

## Technical Details

### Built With

- HTML5
- CSS3
- JavaScript (ES6+)
- JSZip for handling ZIP files

### Key Components

- `parser.js`: Core chat parsing logic
- `overlay.js`: Author filtering system
- `style.css`: Main styling
- `overlay.css`: Menu and overlay styling

## Setting up Locally

You can run this project locally in several ways:

### Using Python (Simplest)

```bash
git clone https://github.com/jmegaraujo/WhatsAppChatViewer.git
cd WhatsAppChatViewer
python3 -m http.server
```
Then open `http://localhost:8000` in your browser

### Using Node.js

```bash
git clone https://github.com/jmegaraujo/WhatsAppChatViewer.git
cd WhatsAppChatViewer
npx http-server
```
Then open `http://localhost:8080` in your browser

### Using PHP

```bash
git clone https://github.com/jmegaraujo/WhatsAppChatViewer.git
cd WhatsAppChatViewer
php -S localhost:8000
```
Then open `http://localhost:8000` in your browser

## Contributing

We welcome contributions! Please read our [Contributing Guidelines](CONTRIBUTING.md) for details on how to get started.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

If you find this tool helpful, consider [buying me a coffee](https://www.buymeacoffee.com/jmegaraujo)! ☕️

## Privacy

This tool processes all data locally in your browser. No chat data is ever sent to any server.

---

Made with ❤️ by [José Araújo](https://github.com/jmegaraujo)
