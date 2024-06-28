'use client'
import NextLink from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'

import {
  Button,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Heading,
  HStack,
  Input,
  InputGroup,
  InputRightElement,
  Select,
  useToast,
  VStack,
} from '@/common/design'

// フォームで使用する変数の型を定義
type formInputs = {
  email: string
  password: string
  confirm: string
  local: string
  gender: string
  day:string
  given_name:string
  family_name:string
}

const customContainerStyle = {
  borderWidth: "2px", // 枠の太さ
  borderColor: "gray.200", // 枠の色
  borderRadius: "md", // 角の丸み
  padding: "20px", // 内部の余白
};
/** サインアップ画面
 * @screenname SignUpScreen
 * @description ユーザの新規登録を行う画面
 */
export default function SignUpScreen() {
  const [step, setStep] = useState(1);
  const router = useRouter()
  const toast = useToast()
  const {
    handleSubmit,
    register,
    getValues,
    formState: { errors, isSubmitting },
    setError
  } = useForm<formInputs>()

  const [password, setPassword] = useState(false)
  const [confirm, setConfirm] = useState(false)
  const [year, setYear] = useState('');
  const [month, setMonth] = useState('');

  const onSubmit = handleSubmit(async(data) => {
    if (step === 1) {
      try {
        const formData = new URLSearchParams()
        formData.append('email', data.email)
  
        const response = await fetch('http://localhost:8084/user/check', {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: formData.toString(), // URLエンコードされた文字列をボディとして送信
        })
  
        if (response.ok) {
          setStep(2);
        } else {
          setError('email', {
            type: 'manual',
            message: 'このアドレスはすでに使用されています',
          });
        }
      } catch (error) {
        toast({
          title: 'エラー',
          description: 'ネットワークエラーが発生しました。',
          status: 'error',
          duration: 5000,
          isClosable: true,
        })
      }
    } else {
      // 最終データを送信
      const birthday = new Date(`${year}-${month}-${parseInt(data.day)+1}`);
      const fullname = data.family_name+" "+data.given_name;
      //const lang = window.navigator.languages || window.navigator.language;
      try {
        const requestBody = {
          email: data.email, 
          password: data.password,
          name_ja: fullname,
          given_name: data.given_name,
          family_name:data.family_name,
          locale:data.local,
          gender:parseInt(data.gender),
          birthday:birthday,
        };
  
        const response = await fetch('http://localhost:8084/user/create', {
        method: 'POST', 
        headers: {
          'Content-Type': 'application/json', // 送信データのタイプ
        },
        body: JSON.stringify(requestBody), // JSON形式でデータを送信
      });
  
        if (response.ok) {
          toast({
            title: 'ログイン成功',
            description: 'ログインが成功しました。',
            status: 'success',
            duration: 5000,
            isClosable: true,
          })
          const data = await response.json() // JSONレスポンスを取得
          const redirectUrl = "/signin" // リダイレクト先のURLを取得
          router.push(redirectUrl) // ログイン成功後のリダイレクト
        } else {
          const errorData = await response.json()
          toast({
            title: 'ログイン失敗',
            description: errorData.message || 'ログインに失敗しました。',
            status: 'error',
            duration: 5000,
            isClosable: true,
          })
        }
      } catch (error) {
        toast({
          title: 'エラー',
          description: 'ネットワークエラーが発生しました。',
          status: 'error',
          duration: 5000,
          isClosable: true,
        })
      }
    }
  });

  const backState = () => {
    setStep(step-1)
  };
  const passwordClick = () => setPassword(!password)
  const confirmClick = () => setConfirm(!confirm)

  return (
    <Flex height='100vh' justifyContent='center' alignItems='center'>
      <VStack spacing='5'　width="350px"　style={customContainerStyle}>
        <Heading>新規登録</Heading>
        <form onSubmit={onSubmit}>
        {step === 1 && (
          <VStack alignItems='left'>
            <FormControl isInvalid={Boolean(errors.email)}>
              <FormLabel htmlFor='email' textAlign='start'>
                メールアドレス
              </FormLabel>
              <Input
                id='email'
                {...register('email', {
                  required: '必須項目です',
                  maxLength: {
                    value: 50,
                    message: '50文字以内で入力してください',
                  },
                  pattern: {
                    value:
                      /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@+[a-zA-Z0-9-]+\.+[a-zA-Z0-9-]+$/,
                    message: 'メールアドレスの形式が違います',
                  },
                })}
              />
              <FormErrorMessage>
                {errors.email && errors.email.message}
              </FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={Boolean(errors.password)}>
              <FormLabel htmlFor='password'>パスワード</FormLabel>
              <InputGroup size='md'>
                <Input
                  pr='4.5rem'
                  type={password ? 'text' : 'password'}
                  {...register('password', {
                    required: '必須項目です',
                    minLength: {
                      value: 8,
                      message: '8文字以上で入力してください',
                    },
                    maxLength: {
                      value: 50,
                      message: '50文字以内で入力してください',
                    },
                    pattern: {
                      value: /^(?=.*[A-Z])[0-9a-zA-Z]*$/,
                      message:
                        '半角英数字かつ少なくとも1つの大文字を含めてください',
                    },
                  })}
                />
                <InputRightElement width='4.5rem'>
                  <Button h='1.75rem' size='sm' onClick={passwordClick}>
                    {password ? 'Hide' : 'Show'}
                  </Button>
                </InputRightElement>
              </InputGroup>
              <FormErrorMessage>
                {errors.password && errors.password.message}
              </FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={Boolean(errors.confirm)}>
              <FormLabel htmlFor='confirm'>パスワード確認</FormLabel>
              <InputGroup size='md'>
                <Input
                  pr='4.5rem'
                  type={confirm ? 'text' : 'password'}
                  {...register('confirm', {
                    required: '必須項目です',
                    minLength: {
                      value: 8,
                      message: '8文字以上で入力してください',
                    },
                    maxLength: {
                      value: 50,
                      message: '50文字以内で入力してください',
                    },
                    pattern: {
                      value: /^(?=.*[A-Z])[0-9a-zA-Z]*$/,
                      message:
                        '半角英数字かつ少なくとも1つの大文字を含めてください',
                    },
                    validate: (value) =>
                      value === getValues('password') ||
                      'パスワードが一致しません',
                  })}
                />
                <InputRightElement width='4.5rem'>
                  <Button h='1.75rem' size='sm' onClick={confirmClick}>
                    {confirm ? 'Hide' : 'Show'}
                  </Button>
                </InputRightElement>
              </InputGroup>
              <FormErrorMessage>
                {errors.confirm && errors.confirm.message}
              </FormErrorMessage>
            </FormControl>

            <Button
              marginTop='4'
              color='white'
              bg='teal.400'
              isLoading={isSubmitting}
              type='submit'
              paddingX='auto'
              _hover={{
                borderColor: 'transparent',
                boxShadow: '0 7px 10px rgba(0, 0, 0, 0.3)',
              }}
            >
              次へ
            </Button>
            <Button
              as={NextLink}
              href='/signin'
              bg='white'
              width='100%'
              _hover={{
                borderColor: 'transparent',
                boxShadow: '0 7px 10px rgba(0, 0, 0, 0.3)',
              }}
            >
              ログインはこちらから
            </Button>
          </VStack>
        )}
        {step === 2 && (
          <VStack alignItems="left">
            <HStack spacing="2">
            <FormControl isInvalid={Boolean(errors.gender)}>
              <FormLabel>性別</FormLabel>
              <Select {...register('gender', { required: '必須項目です' })}>
                <option value="0">選択してください</option>
                <option value="1">男性</option>
                <option value="2">女性</option>
                <option value="9">その他</option>
              </Select>
              <FormErrorMessage>
                {errors.gender && errors.gender.message}
              </FormErrorMessage>
            </FormControl>
            <FormControl isInvalid={Boolean(errors.local)}>
              <FormLabel>言語</FormLabel>
              <Select {...register('local', { required: '必須項目です' })}>
                <option value="">選択してください</option>
                <option value="ja">日本語</option>
                <option value="en">English</option>
                <option value="9">その他</option>
              </Select>
              <FormErrorMessage>
                {errors.local && errors.local.message}
              </FormErrorMessage>
            </FormControl>
            </HStack>
          <FormControl isInvalid={Boolean(errors.day)}>
              <FormLabel>生年月日</FormLabel>
              <HStack spacing="2"> {/* 横に並べる */}
                <Select
                  placeholder="年"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  isRequired
                >
                  {Array.from({ length: 100 }, (_, i) => 2023 - i).map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </Select>

                <Select
                  placeholder="月"
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                  isRequired
                >
                  {Array.from({ length: 12 }, (_, i) => i+1).map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </Select>

                <Input
                  type="number"
                  placeholder="日"
                  {...register('day', {
                    required: '必須項目です',
                    min: 1,
                    max: 32,
                  })}
                />
              </HStack>
              <FormErrorMessage>
                {errors.day && errors.day.message}
              </FormErrorMessage>
            </FormControl>
            <HStack spacing="2">
            <FormControl isInvalid={Boolean(errors.family_name)}>
              <FormLabel htmlFor='family_name' textAlign='start'>
                性
              </FormLabel>
              <Input
                id='family_name'
                {...register('family_name', {
                  required: '必須項目です',
                  maxLength: {
                    value: 50,
                    message: '50文字以内で入力してください',
                  },
                })}
              />
              <FormErrorMessage>
                {errors.family_name && errors.family_name.message}
              </FormErrorMessage>
            </FormControl>
            <FormControl isInvalid={Boolean(errors.given_name)}>
              <FormLabel htmlFor='given_name' textAlign='start'>
                名
              </FormLabel>
              <Input
                id='given_name'
                {...register('given_name', {
                  required: '必須項目です',
                  maxLength: {
                    value: 50,
                    message: '50文字以内で入力してください',
                  },
                })}
              />
              <FormErrorMessage>
                {errors.given_name && errors.given_name.message}
              </FormErrorMessage>
            </FormControl>
            </HStack>
            
            <Button
                marginTop='4'
                color='white'
                bg='gray'
                onClick={backState}
                paddingX='auto'
                _hover={{
                  borderColor: 'transparent',
                  boxShadow: '0 7px 10px rgba(0, 0, 0, 0.3)',
                }}
              >
                戻る
              </Button>
              <Button
                color='white'
                bg='teal.400'
                isLoading={isSubmitting}
                type='submit'
                paddingX='auto'
                _hover={{
                  borderColor: 'transparent',
                  boxShadow: '0 7px 10px rgba(0, 0, 0, 0.3)',
                }}
              >
                登録
              </Button>
        </VStack>
        )}
        </form>
        
      </VStack>
    </Flex>
  )
}