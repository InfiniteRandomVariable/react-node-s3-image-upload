1. Write to disk instead of using system RAM for temp storage of image data.
2. Reformat the file to jpg prior uploading to S3 for more secure and higher efficiency
3. Support upload multiple images instead of one image, currently we only test two images.
4. Files with valid image extensions will add to each file.
5. Delete the local disk storage for these images after each upload
6. Use chakra-ui for UI coz of it is a standard choice and time-saving.
7. Image resizing, positioning, cropping by reducing the file size by more than 80%, depending on the original size of the file.
8. Change to typescript later.

Adding listeners and events References:
https://www.falldowngoboone.com/blog/talk-to-your-react-components-with-custom-events/
https://blog.logrocket.com/using-custom-events-react/
