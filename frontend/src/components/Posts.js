import { Box, Button, Text, Input } from '@chakra-ui/react';
import { useState } from 'react';
import useMutation from '../hooks/useMutations';

//import { fileTypeFromFile } from 'file-type'; need EMS but this is CommonJS format
//issue https://github.com/sindresorhus/file-type/issues/662

// const imageFilesValidation = async (files, next) => {
//   try {
//     for (const file in files) {

//       const type = await fileTypeFromFile(file.name);
//       // validate
//       const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
//       if (!type || !allowedTypes.includes(type.mime))
//         return next(new Error('Invalid file type'));

//       return next();
//     }
//   } catch (error) {
//     return next(new Error('Internal server error'));
//   }
// };

const URL = '/images';

const ErrorText = ({ children, ...props }) => (
  <Text fontSize="lg" color="red.300" {...props}>
    {children}
  </Text>
);

const Posts = () => {
  const {
    mutate: uploadImage,
    isLoading: upLoading,
    error: uploadError,
  } = useMutation({ url: URL });
  const [error, setError] = useState('');
  const handleUpload = async e => {
    console.log(e);
    const file = e.target.files[0];
    console.log(file);

    //TODO add image validator of your choice. See the top comment
    const validateImg = true;

    if (validateImg == false) {
      console.log('validating image failed');
      setError('File must be in JPG/PNG format');
      return;
    }

    const form = new FormData();
    form.append('images[]', file);

    await uploadImage(form);
  };

  return (
    <Box mt={6}>
      <Input id="imageInput" type="file" hidden onChange={handleUpload} />
      <Button
        as="label"
        htmlFor="imageInput"
        colorScheme="blue"
        variant="outline"
        mb={4}
        cursor="pointer"
        isLoading={upLoading}
      >
        Upload
      </Button>
      {error && <ErrorText>{error}</ErrorText>}
      {uploadError && <ErrorText>{uploadError}</ErrorText>}

      <Text textAlign="left" mb={4}>
        Posts
      </Text>
    </Box>
  );
};
export default Posts;
