# MusicMetaFinder

MusicMetaFinder is a powerful CLI tool designed for audio file metadata processing. It allows bulk recognition of audio files, fetches metadata, and enriches the files with relevant details. The tool leverages multiple services to gather comprehensive metadata, which can then be used to update file titles, embed album art, and add other pertinent information.

With its ability to process an entire directory or individual files, MusicMetaFinder is a robust tool for music enthusiasts and professionals who need to organize and label their audio collections efficiently.

## Features

- **Bulk Processing**: Process an entire directory or select files with ease.
- **Metadata Recognition**: Identify tracks and fetch metadata from the top music databases.
- **Metadata Writing**: Update files with titles, album art, and other metadata.
- **Multi-Service Integration**: Utilize and combine multiple services simultaneously for rich metadata collection.
- **CLI Functionality**: Seamless operation as a command-line interface for easy scripting and automation.

## Installation

**1. Dependencies  Requirement**
    - Ensure both FFmpeg and Chromaprint are installed and available in your system’s PATH.

```sh
# On Windows
winget install ffmpeg && winget install chromaprint

# On macOS
brew install ffmpeg chromaprint

# On Linux
sudo apt-get install ffmpeg chromaprint
```

**2. MusicMetaFinder Installation**

```
npm install music-meta-finder --save
```

**3. .env Configuration**
    - Create a .env file in the root of your project with the following variables:

```
ACOUSTID_API_KEY=your_acoustid_api_key_here
PROJECTNAME=YourProjectName
VERSION=1.0.0
EMAIL=<your_email@example.com>
```

For Acoustid API Key register on their [website](https://acoustid.org/) and then copy it from [here](https://acoustid.org/api-key).

## Usage

- **Directory/File Processing**


```
music-meta-finder analyze path/to/your/directory/or/file
```


## Examples

- **Example 1: Bulk Processing Path**

```
music-meta-finder analyze C:/Music
```

- **Example 2: Processing a Single File**


```
music-meta-finder analyze C:/Music/song.mp3
```

## Troubleshooting

- **Common Issue: Missing ffmpeg**
    - Ensure ffmpeg is installed and added to your **PATH**. Refer to the installation section.
- **API Key Issues**
    - Make sure your **ACOUSTID_API_KEY** in the .env file is valid and active.

## Contribution

- **If you are interested in contributing to MusicMetaFinder, please follow these guidelines:**
  - Fork the repository.
  - Create a new branch: git checkout -b feature/your-feature.
  - Commit your changes: git commit -m 'Add some feature'.
  - Push to the branch: git push origin feature/your-feature.
  - Open a pull request.

For major changes, please open an issue first to discuss what you would like to change.

## License

This project is licensed under the GPL-3.0 license.

## Contact

For any inquiries, please contact me on [telegram](https://t.me/xtrll).

