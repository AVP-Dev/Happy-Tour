// pages/offer.js
import Head from 'next/head';
import { Box, Container, Heading, Text, List, ListItem, VStack, Divider, UnorderedList, Alert, AlertIcon, AlertTitle, AlertDescription } from '@chakra-ui/react';

// Вспомогательные компоненты для стилизации, аналогичные странице "Политика конфиденциальности"
const Section = ({ children }) => (
    <Box as="section" mb={10}>
        {children}
    </Box>
);

const MainHeading = (props) => (
    <Heading as="h1" size="xl" textAlign="center" mb={2} color="gray.800" {...props} />
);

const SectionHeading = (props) => (
    <Heading as="h2" size="lg" mt={8} mb={4} color="gray.700" fontWeight="bold" borderBottomWidth="2px" borderColor="brand.200" pb={2} {...props} />
);

const SubHeading = (props) => (
    <Heading as="h3" size="md" mt={6} mb={3} color="gray.600" fontWeight="semibold" {...props} />
);

const Paragraph = (props) => (
    <Text mb={4} lineHeight="tall" color="gray.700" {...props} />
);

const StyledList = (props) => (
    <VStack as={List} spacing={3} pl={5} mb={4} align="stretch" {...props} />
);

export default function OfferPage() {
    return (
        <>
            <Head>
                <title>Публичный договор (оферта) - Happy Tour</title>
                <meta name="description" content="Публичный договор возмездного оказания туристических услуг ООО «ХэппиТрэвелКлаб»." />
            </Head>
            {/* ИЗМЕНЕНИЕ: Убрал `bg="white"` чтобы фоновый паттерн был виден */}
            <Box py={{ base: 24, md: 32 }}>
                <Container maxW="container.lg">
                    <MainHeading>Публичный договор возмездного оказания туристических услуг</MainHeading>
                    
                    <Alert status="warning" variant="subtle" flexDirection="column" alignItems="center" justifyContent="center" textAlign="center" mt={8} borderRadius="lg">
                      <AlertIcon boxSize="40px" mr={0} />
                      <AlertTitle mt={4} mb={1} fontSize="lg">ВНИМАНИЕ!</AlertTitle>
                      <AlertDescription maxWidth="container.md">
                        Внимательно ознакомьтесь с условиями настоящего Договора. Принятие (акцепт) условий настоящего Договора означает полное и безоговорочное согласие Туриста со всеми условиями Договора без каких-либо изъятий или ограничений.
                      </AlertDescription>
                    </Alert>

                    <Section>
                        <SectionHeading>1. Предмет договора</SectionHeading>
                        <Paragraph>1.1. Исполнитель обязуется по заданию Заказчика оказать туристические услуги, а Заказчик обязуется принять и оплатить оказанные услуги.</Paragraph>
                        <Paragraph>1.2. Конкретный перечень, объем, сроки и стоимость туристических услуг (далее – «Тур») определяются в заявке на бронирование, являющейся неотъемлемой частью настоящего Договора.</Paragraph>
                    </Section>

                    <Section>
                        <SectionHeading>2. Права и обязанности сторон</SectionHeading>
                        <SubHeading>2.1. Исполнитель обязан:</SubHeading>
                        <StyledList as={UnorderedList} styleType="disc">
                            <ListItem>Предоставить Заказчику полную и достоверную информацию об условиях Тура.</ListItem>
                            <ListItem>Оказать услуги в соответствии с условиями настоящего Договора.</ListItem>
                            <ListItem>Передать Заказчику необходимые для путешествия документы после полной оплаты Тура.</ListItem>
                        </StyledList>
                        <SubHeading>2.2. Заказчик обязан:</SubHeading>
                        <StyledList as={UnorderedList} styleType="disc">
                            <ListItem>Предоставить Исполнителю полную и достоверную информацию, необходимую для оформления Тура.</ListItem>
                            <ListItem>Своевременно и в полном объеме оплатить стоимость Тура.</ListItem>
                            <ListItem>Соблюдать правила пребывания в стране (месте) временного пребывания.</ListItem>
                            <ListItem>Возместить Исполнителю фактически понесенные расходы в случае отказа от Тура.</ListItem>
                        </StyledList>
                    </Section>

                    <Section>
                        <SectionHeading>3. Порядок заключения договора (акцепт оферты)</SectionHeading>
                        <Paragraph>3.1. Размещение текста настоящего Договора-оферты на сайте happytour.by является публичным предложением Исполнителя заключить Договор.</Paragraph>
                        <Paragraph>3.2. Акцептом настоящего Договора признается совершение Заказчиком следующих действий: оформление заявки на бронирование Тура на сайте или произведение оплаты Тура.</Paragraph>
                    </Section>

                    <Section>
                        <SectionHeading>4. Порядок расчетов</SectionHeading>
                        <Paragraph>4.1. Стоимость Тура указывается в белорусских рублях. Оплата производится в порядке и в сроки, установленные Исполнителем.</Paragraph>
                        <Paragraph>4.2. В случае несвоевременной или неполной оплаты Тура Исполнитель вправе аннулировать бронирование с удержанием фактически понесенных расходов.</Paragraph>
                    </Section>

                    <Section>
                        <SectionHeading>5. Ответственность сторон</SectionHeading>
                        <Paragraph>5.1. Стороны несут ответственность за неисполнение своих обязательств в соответствии с законодательством Республики Беларусь.</Paragraph>
                        <Paragraph>5.2. Исполнитель не несет ответственности за действия или бездействие третьих лиц (туроператоров, перевозчиков, средств размещения), отказ в выдаче визы, изменение расписания движения транспорта.</Paragraph>
                    </Section>

                    <Section>
                        <SectionHeading>6. Форс-мажор</SectionHeading>
                        <Paragraph>6.1. Стороны освобождаются от ответственности за неисполнение обязательств, если это явилось следствием обстоятельств непреодолимой силы (стихийные бедствия, военные действия, эпидемии и т.п.).</Paragraph>
                    </Section>
                    
                    <Section>
                        <SectionHeading>7. Разрешение споров</SectionHeading>
                        <Paragraph>7.1. Все споры разрешаются путем переговоров. В случае невозможности достижения согласия, споры подлежат рассмотрению в суде по месту нахождения Исполнителя.</Paragraph>
                    </Section>

                    <Section>
                        <SectionHeading>8. Реквизиты исполнителя</SectionHeading>
                        <Box p={6} borderWidth="1px" borderRadius="lg" borderColor="gray.200" bg="gray.50">
                            <VStack align="flex-start" spacing={2}>
                                <Text><strong>Наименование:</strong> ООО «ХэппиТрэвелКлаб»</Text>
                                <Text><strong>УНП:</strong> 491678156</Text>
                                <Text><strong>Юридический адрес:</strong> Гомельская область, г. Речица, ул. Советская, д. 80, 1 этаж</Text>
                                <Divider my={2} />
                                <Text><strong>Расчетный счет:</strong> BY13BPSB30123351840119330000</Text>
                                <Text><strong>Банк:</strong> ОАО "СБЕР БАНК", БИК: BPSBBY2X</Text>
                                <Divider my={2} />
                                <Text><strong>Телефон:</strong> +375 (44) 788-67-61</Text>
                                <Text><strong>E-mail:</strong> info@happytour.by</Text>
                            </VStack>
                        </Box>
                    </Section>

                </Container>
            </Box>
        </>
    );
}
